import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import DebitoFarmacia from "App/Models/Debitofarmacia";
import ftpClient from "ftp-client";
import fs from "fs";
import AWS from "aws-sdk";
import Env from "@ioc:Adonis/Core/Env";
import { Debitofarmacia } from "App/Helper/ModelIndex";

export default class DebitosController {
  private sanitizarLogFtp(mensaje: unknown): string {
    return String(mensaje)
      .replace(/(PASS\s+)[^'\r\n]*/gi, "$1********")
      .replace(/(password["']?\s*[:=]\s*["']?)[^,"'\s}]+/gi, "$1********");
  }

  private contextoErrorFtp(client: any, error: any, etapa: string, carpetaRemota: string, ultimoPasv?: Record<string, unknown>) {
    const control = client?.ftp?._socket;
    const datos = client?.ftp?._pasvSocket;
    const propiedadesError = error && typeof error === "object"
      ? Object.fromEntries(Object.getOwnPropertyNames(error).map((clave) => [clave, error[clave]]))
      : { message: String(error) };

    return {
      fecha: new Date().toISOString(),
      etapa,
      carpetaRemota,
      ultimoPasv: ultimoPasv ?? "el servidor no llegó a anunciar un endpoint PASV",
      comandoActual: client?.ftp?._curReq?.cmd
        ? this.sanitizarLogFtp(client.ftp._curReq.cmd)
        : "sin comando pendiente",
      colaPendiente: client?.ftp?._queue?.length,
      control: control ? {
        local: `${control.localAddress ?? "?"}:${control.localPort ?? "?"}`,
        remoto: `${control.remoteAddress ?? "?"}:${control.remotePort ?? "?"}`,
        conectado: client?.ftp?.connected,
        readable: control.readable,
        writable: control.writable,
        destroyed: control.destroyed,
      } : "socket no disponible",
      datosPasivos: datos ? {
        local: `${datos.localAddress ?? "?"}:${datos.localPort ?? "?"}`,
        remoto: `${datos.remoteAddress ?? "?"}:${datos.remotePort ?? "?"}`,
        readable: datos.readable,
        writable: datos.writable,
        destroyed: datos.destroyed,
      } : "socket no establecido (ver respuesta PASV en el log de protocolo)",
      error: propiedadesError,
    };
  }

  private adjuntarDiagnosticoFtp(error: any, diagnostico: Record<string, unknown>): Error {
    const errorConDiagnostico = error instanceof Error ? error : new Error(String(error));
    (errorConDiagnostico as any).diagnosticoFtp = diagnostico;
    return errorConDiagnostico;
  }

  private escaparHtml(valor: unknown): string {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private detalleErrorFtp(error: any, carpetaRemota: string) {
    const codigo = error?.code ? `FTP ${error.code}` : "Sin código FTP";
    const mensaje = error?.message ?? String(error);

    return {
      codigo,
      mensaje,
      carpetaRemota,
      diagnostico: error?.diagnosticoFtp,
      noExiste: Number(error?.code) === 550 || /\b550\b|does not exist|no such file|not found/i.test(mensaje),
    };
  }

  /**
   * ftp-client no propaga sus fallas asíncronas al await del controlador. Esta
   * envoltura espera la conexión, verifica la carpeta y recién entonces inicia
   * la descarga, para poder informar todos los datos al front.
   */
  private descargarCarpetaDebitos(
    configuracion: Record<string, unknown>,
    carpetaRemota: string,
    carpetaLocal: string,
    overwrite: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log(`[Débitos FTP] Iniciando conexión para recuperar ${carpetaRemota}`);
      let etapa = "conexión de control";
      let ultimoPasv: Record<string, unknown> | undefined;
      const configuracionConDebug = {
        ...configuracion,
        debug: (mensaje: unknown) => {
          const mensajeSeguro = this.sanitizarLogFtp(mensaje);
          console.log(`[Débitos FTP][${carpetaRemota}][protocolo] ${mensajeSeguro}`);

          const pasv = /\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/.exec(mensajeSeguro);
          if (pasv) {
            const hostAnunciado = `${pasv[1]}.${pasv[2]}.${pasv[3]}.${pasv[4]}`;
            const puertoAnunciado = Number(pasv[5]) * 256 + Number(pasv[6]);
            ultimoPasv = { hostAnunciado, puertoAnunciado };
            console.log(`[Débitos FTP][${carpetaRemota}][PASV] El servidor anunció la conexión de datos en ${hostAnunciado}:${puertoAnunciado}`);
          }
        },
      };
      const client: any = new (ftpClient as any)(configuracionConDebug, { logging: "none" });
      let terminado = false;

      const finalizar = (callback: (valor: any) => void, valor: any) => {
        if (terminado) return;
        terminado = true;
        try {
          client.ftp.end();
        } catch (_) {
          // La conexión puede no haberse establecido todavía.
        }
        callback(valor);
      };

      // El paquete instala un listener que hace throw. Lo reemplazamos para
      // convertir el error de red/autenticación en una respuesta controlada.
      client.ftp.removeAllListeners("error");
      client.ftp.once("error", (error: Error) => {
        const diagnostico = this.contextoErrorFtp(client, error, etapa, carpetaRemota, ultimoPasv);
        console.error(
          `[Débitos FTP] Error de conexión/transferencia en ${carpetaRemota}`,
          diagnostico
        );
        finalizar(reject, this.adjuntarDiagnosticoFtp(error, diagnostico));
      });
      client.ftp.once("ready", () => {
        etapa = "conexión de control establecida";
        console.log(`[Débitos FTP] Conectado. Verificando carpeta remota ${carpetaRemota}`);
        const listar = (carpeta: string): Promise<any[]> => new Promise((resolver, rechazar) => {
          etapa = `LIST ${carpeta} (conexión pasiva de datos)`;
          console.log(`[Débitos FTP][${carpetaRemota}] Solicitando listado remoto: ${carpeta}`);
          client.ftp.list(carpeta, (error: Error, lista: any[]) => {
            if (error) {
              const diagnostico = this.contextoErrorFtp(client, error, etapa, carpetaRemota, ultimoPasv);
              console.error(
                `[Débitos FTP][${carpetaRemota}] Falló LIST ${carpeta}`,
                diagnostico
              );
              return rechazar(this.adjuntarDiagnosticoFtp(error, diagnostico));
            }
            resolver(lista ?? []);
          });
        });
        const obtener = (archivoRemoto: string, archivoLocal: string): Promise<void> => new Promise((resolver, rechazar) => {
          etapa = `RETR ${archivoRemoto} (conexión pasiva de datos)`;
          const rechazarConDiagnostico = (error: any) => {
            const diagnostico = this.contextoErrorFtp(client, error, etapa, carpetaRemota, ultimoPasv);
            console.error(`[Débitos FTP][${carpetaRemota}] Falló RETR ${archivoRemoto}`, diagnostico);
            rechazar(this.adjuntarDiagnosticoFtp(error, diagnostico));
          };
          client.ftp.get(archivoRemoto, (error: Error, stream: any) => {
            if (error || !stream) {
              const errorDescarga = error ?? new Error(`No se pudo abrir ${archivoRemoto}`);
              return rechazarConDiagnostico(errorDescarga);
            }
            const salida = fs.createWriteStream(archivoLocal);
            stream.once("error", rechazarConDiagnostico);
            salida.once("error", rechazarConDiagnostico);
            stream.once("close", resolver);
            stream.pipe(salida);
          });
        });

        (async () => {
          const archivos: Array<{ remoto: string; local: string; fecha?: Date }> = [];
          const relevar = async (remota: string, local: string): Promise<void> => {
            const lista = await listar(remota);
            for (const entrada of lista) {
              if (entrada.name === "." || entrada.name === "..") continue;
              const rutaRemota = `${remota}/${entrada.name}`;
              const rutaLocal = `${local}/${entrada.name}`;
              if (entrada.type === "d") {
                fs.mkdirSync(rutaLocal, { recursive: true });
                await relevar(rutaRemota, rutaLocal);
              } else if (entrada.type === "-") {
                archivos.push({ remoto: rutaRemota, local: rutaLocal, fecha: entrada.date });
              }
            }
          };

          try {
            await relevar(carpetaRemota, carpetaLocal);
            console.log(`[Débitos FTP] Carpeta verificada. Se encontraron ${archivos.length} archivo(s) en ${carpetaRemota}.`);

            const resultado = { downloadedFiles: [] as string[], errors: {} as Record<string, unknown> };
            for (let indice = 0; indice < archivos.length; indice++) {
              const archivo = archivos[indice];
              const existe = fs.existsSync(archivo.local);
              const omitir = existe && (overwrite === "skip" || overwrite === "none" || (overwrite === "older" && (!archivo.fecha || fs.statSync(archivo.local).mtime >= archivo.fecha)));
              if (omitir) {
                console.log(`[Débitos FTP] Omitido ${indice + 1}/${archivos.length}: ${archivo.remoto}`);
                continue;
              }

              console.log(`[Débitos FTP] Descargando ${indice + 1}/${archivos.length}: ${archivo.remoto}`);
              try {
                await obtener(archivo.remoto, archivo.local);
                resultado.downloadedFiles.push(archivo.remoto);
              } catch (error) {
                resultado.errors[archivo.remoto] = {
                  mensaje: error instanceof Error ? error.message : String(error),
                  diagnostico: (error as any)?.diagnosticoFtp,
                };
                console.error(`[Débitos FTP] Error al descargar ${indice + 1}/${archivos.length}: ${archivo.remoto}`, error);
              }
            }
            console.log(`[Débitos FTP] Descarga finalizada en ${carpetaRemota}: ${resultado.downloadedFiles.length} archivo(s), ${Object.keys(resultado.errors).length} error(es).`);
            finalizar(resolve, resultado);
          } catch (error) {
            finalizar(reject, error);
          }
        })();
      });

      try {
        console.log(`[Débitos FTP][${carpetaRemota}] Destino de control: ${String(configuracion.host)}:${String(configuracion.port ?? 21)}; timeout control=${String(configuracion.connTimeout ?? "default")}ms; timeout PASV=${String(configuracion.pasvTimeout ?? "default")}ms`);
        client.ftp.connect(configuracionConDebug);
      } catch (error) {
        const diagnostico = this.contextoErrorFtp(client, error, etapa, carpetaRemota, ultimoPasv);
        console.error(
          `[Débitos FTP] Excepción síncrona al conectar con ${carpetaRemota}`,
          diagnostico
        );
        finalizar(reject, this.adjuntarDiagnosticoFtp(error, diagnostico));
      }
    });
  }

  private respuestaHtmlDebitos(
    ctx: HttpContextContract,
    estado: number,
    titulo: string,
    detalle: Record<string, unknown>
  ) {
    const filas = Object.entries(detalle)
      .map(([clave, valor]) => {
        const contenido = typeof valor === "object" && valor !== null
          ? `<pre>${this.escaparHtml(JSON.stringify(valor, null, 2))}</pre>`
          : this.escaparHtml(valor);
        return `<tr><th>${this.escaparHtml(clave)}</th><td>${contenido}</td></tr>`;
      })
      .join("");

    return ctx.response
      .status(estado)
      .type("text/html")
      .send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${this.escaparHtml(titulo)}</title><style>body{font-family:system-ui,sans-serif;margin:2rem;color:#1f2937}table{border-collapse:collapse;margin-top:1rem;max-width:100%}th,td{border:1px solid #d1d5db;padding:.55rem;text-align:left;vertical-align:top}th{background:#f3f4f6}pre{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.error{color:#b91c1c}</style></head><body><h1 class="${estado >= 400 ? "error" : ""}">${this.escaparHtml(titulo)}</h1><table>${filas}</table></body></html>`);
  }

  private async descargarAmbasCarpetasDebitos(ctx: HttpContextContract, periodo: string, overwrite: string) {
    const localPathToList = process.cwd() + "/public/debitos/" + periodo;
    const srcFTP = {
      host: Env.get("DEBITOS_FTP_SERVER"),
      user: Env.get("DEBITOS_FTP_USER"),
      password: Env.get("DEBITOS_FTP_PASSWORD"),
      port: 21,
      connTimeout: 60000,
      pasvTimeout: 60000,
    };

    try {
      fs.mkdirSync(localPathToList, { recursive: true });
      const carpetas = [`${periodo}01`, `${periodo}02`];
      const resultados: Record<string, unknown> = {};
      const errores: Record<string, unknown> = {};
      let archivosDescargados = 0;

      for (const carpetaRemota of carpetas) {
        try {
          const resultado = await this.descargarCarpetaDebitos(srcFTP, carpetaRemota, localPathToList, overwrite);
          archivosDescargados += resultado.downloadedFiles?.length ?? 0;
          resultados[carpetaRemota] = {
            archivosDescargados: resultado.downloadedFiles?.length ?? 0,
            errores: resultado.errors ?? "Sin errores",
          };
          if (Object.keys(resultado.errors ?? {}).length) errores[carpetaRemota] = resultado.errors;
        } catch (error) {
          const detalle = this.detalleErrorFtp(error, carpetaRemota);
          console.error(`[Débitos FTP] No se pudo recuperar ${carpetaRemota}`, error);
          errores[carpetaRemota] = {
            etapa: detalle.noExiste ? "Verificación de carpeta remota" : "Conexión o transferencia FTP",
            codigo: detalle.codigo,
            detalle: detalle.mensaje,
            diagnosticoFtp: detalle.diagnostico ?? "Sin diagnóstico adicional",
          };
        }
      }

      const huboErrores = Object.keys(errores).length > 0;
      return this.respuestaHtmlDebitos(ctx, huboErrores ? 207 : 200, huboErrores ? "Descarga finalizada con errores" : "Descarga finalizada correctamente", {
        periodo,
        overwrite,
        archivosDescargados,
        resultados,
        errores: huboErrores ? errores : "Sin errores",
      });
    } catch (error) {
      console.error(`[Débitos FTP] Error local al preparar la descarga del período ${periodo}`, error);
      return this.respuestaHtmlDebitos(ctx, 500, "No se pudo preparar la descarga", {
        periodo,
        etapa: "Preparación de carpeta local",
        detalle: error instanceof Error ? error.message : String(error),
      });
    }
  }

  public async debitos({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_DEBITOPAMI);

      const { cufe, periodo } = request.params();
      const debitos = await DebitoFarmacia.query()
        .where("usuario", cufe)
        .andWhere("periodo", periodo);
      return {
        statusCode: 200,
        body: debitos,
        message: debitos.length > 0 ? "Debitos" : "No se encontraron Debitos",
      };
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async subirDebitos(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;
    const overwriteOption = request.param("overwrite") ?? "all";

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    console.log(`[Débitos FTP] Iniciando descarga general para período ${periodo} (overwrite: ${overwriteOption})`);
    return this.descargarAmbasCarpetasDebitos(ctx, periodo, overwriteOption);
  }

  public async subirDebitosSkip(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    console.log(`[Débitos FTP] Iniciando descarga general sin sobrescritura para período ${periodo}`);
    return this.descargarAmbasCarpetasDebitos(ctx, periodo, "skip");
  }

  public async subirDebitos1(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;
    const overwriteOption = request.param("overwrite") ?? "all";

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    try {
      console.log(`[Débitos FTP] Buscando archivos de carpeta 01 para período ${periodo}`);
      const localPathToList = process.cwd() + "/public/debitos/" + periodo;
      fs.mkdirSync(localPathToList, { recursive: true });
      const remotePath = periodo + "01";
      const srcFTP = {
        host: Env.get("DEBITOS_FTP_SERVER"), //"intercambio.observer.com.ar",
        user: Env.get("DEBITOS_FTP_USER"), //"col2dasfe",
        password: Env.get("DEBITOS_FTP_PASSWORD"), //"95wHKJ8a5c",
        port: 21,
        connTimeout: 60000,
        pasvTimeout: 60000,
      };
      const resultado = await this.descargarCarpetaDebitos(srcFTP, remotePath, localPathToList, overwriteOption);
      const errores = Object.entries(resultado.errors ?? {});

      return this.respuestaHtmlDebitos(ctx, errores.length ? 207 : 200, errores.length ? "Descarga finalizada con errores" : "Descarga finalizada correctamente", {
        periodo,
        carpetaRemota: remotePath,
        archivosDescargados: resultado.downloadedFiles?.length ?? 0,
        errores: resultado.errors ?? "Sin errores",
      });
    } catch (err) {
      console.error("Error al descargar débitos carpeta 01", err);
      const detalle = this.detalleErrorFtp(err, `${periodo}01`);
      return this.respuestaHtmlDebitos(ctx, 502, "No se pudo recuperar la carpeta remota", {
        etapa: detalle.noExiste ? "Verificación de carpeta remota" : "Conexión o transferencia FTP",
        periodo,
        carpetaRemota: detalle.carpetaRemota,
        codigo: detalle.codigo,
        detalle: detalle.mensaje,
        diagnosticoFtp: detalle.diagnostico ?? "Sin diagnóstico adicional",
        sugerencia: detalle.noExiste ? "La carpeta no existe o el usuario FTP no tiene permiso para listarla." : "Verifique conectividad, modo pasivo, credenciales y permisos desde el servidor.",
      });
    }
  }

  public async subirDebitos2(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;
    const overwriteOption = request.param("overwrite") ?? "all";
    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    try {
      console.log(`[Débitos FTP] Buscando archivos de carpeta 02 para período ${periodo}`);
      const localPathToList = process.cwd() + "/public/debitos/" + periodo;
      fs.mkdirSync(localPathToList, { recursive: true });
      const remotePath = periodo + "02";
      const srcFTP = {
        host: Env.get("DEBITOS_FTP_SERVER"), //"intercambio.observer.com.ar",
        user: Env.get("DEBITOS_FTP_USER"), //"col2dasfe",
        password: Env.get("DEBITOS_FTP_PASSWORD"), //"95wHKJ8a5c",
        port: 21,
        connTimeout: 60000,
        pasvTimeout: 60000,
      };
      const resultado = await this.descargarCarpetaDebitos(srcFTP, remotePath, localPathToList, overwriteOption);
      const errores = Object.entries(resultado.errors ?? {});

      return this.respuestaHtmlDebitos(ctx, errores.length ? 207 : 200, errores.length ? "Descarga finalizada con errores" : "Descarga finalizada correctamente", {
        periodo,
        carpetaRemota: remotePath,
        archivosDescargados: resultado.downloadedFiles?.length ?? 0,
        errores: resultado.errors ?? "Sin errores",
      });
    } catch (err) {
      console.error("Error al descargar débitos carpeta 02", err);
      const detalle = this.detalleErrorFtp(err, `${periodo}02`);
      return this.respuestaHtmlDebitos(ctx, 502, "No se pudo recuperar la carpeta remota", {
        etapa: detalle.noExiste ? "Verificación de carpeta remota" : "Conexión o transferencia FTP",
        periodo,
        carpetaRemota: detalle.carpetaRemota,
        codigo: detalle.codigo,
        detalle: detalle.mensaje,
        diagnosticoFtp: detalle.diagnostico ?? "Sin diagnóstico adicional",
        sugerencia: detalle.noExiste ? "La carpeta no existe o el usuario FTP no tiene permiso para listarla." : "Verifique conectividad, modo pasivo, credenciales y permisos desde el servidor.",
      });
    }
  }

  public async revisarCarpeta(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;
    let count = 0;

    const files = fs.readdirSync(localPathToList);

    count = (files as string[]) ? files.length : 0;

    return `Archivos subidos:  ${count}`;
  }

  public async subirDigital(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let userFolder = Env.get("S3_BUCKET") + "/debitos/" + periodo;

    const s3 = new AWS.S3({
      accessKeyId: Env.get("S3_KEY"),
      secretAccessKey: Env.get("S3_SECRET"),
      // Bucket: Env.get("S3_BUCKET"),
    });

    const uploadBucket = async (nombreArchivo) => {
      const stream = fs.createReadStream(localPathToList + "/" + nombreArchivo);
      var params = {
        Bucket: userFolder,
        Key: nombreArchivo,
        ACL: "public-read",
        Body: stream,
      };
      let subido = await s3.upload(params).promise();

      return subido;
    };

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;
    const files = fs.readdirSync(localPathToList);
    const total = files.length;
    let index = 0;
    for (index; index < files.length; index++) {
      await uploadBucket(files[index]);
    }
    return ctx.response.send(`Archivos subidos : ${index} de ${total}`);
  }

  public async contarDebitos(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let userFolder = "debitos/" + periodo;

    const s3 = new AWS.S3({
      accessKeyId: Env.get("S3_KEY"),
      secretAccessKey: Env.get("S3_SECRET"),
    });

    let count = 0;

    async function contarBucket(c?: string | undefined) {
      const listObjects = await s3
        .listObjectsV2({
          Bucket: Env.get("S3_BUCKET"),
          Prefix: userFolder,
          MaxKeys: 20000,
          StartAfter: c,
        })
        .promise();

      let files = listObjects.Contents ?? [];
      count += files.length;
      if (listObjects.IsTruncated) {
        await contarBucket(listObjects.Contents?.pop()?.Key);
      }
    }
    await contarBucket();

    return `Archivos en ${Env.get("S3_BUCKET") + "/" + userFolder} = ${count}`;
  }

  public async cargarDebitos(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;

    // Busca los débitos de la Farmacia
    fs.readdir(localPathToList, async (err, files) => {
      if (err) {
        console.log(err);
      }
      for (let index = 0; index < files.length; index++) {
        let nombre = files[index];
        let archivo = nombre.split("_");
        let usuario = archivo[0];

        const debitoSearch = await Debitofarmacia.query().where(
          "archivo",
          files[index]
        );

        if (debitoSearch?.length == 0) {
          const debito = new Debitofarmacia();
          debito.merge({
            usuario,
            periodo,
            archivo: files[index],
          });
          await debito.save();
        }
      }
    });

    return `Se inicia la carga de debitos periodo ${periodo} en la Base Datos`;
  }
}
