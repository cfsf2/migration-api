import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import {
  listado,
  modificar,
  insertar,
  eliminar,
  ConfBuilder,
  insertarABM,
} from "App/Helper/configuraciones";
import SConf from "App/Models/SConf";
import { acciones, Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";
import Menu from "App/Models/Menu";
import generarQR from "App/Helper/qrjimp";
import fs from "fs";
import path from "path";
import _ from "lodash";

const preloadRecursivo = (query) => {
  return query
    .preload("conf_permiso", (query) => query.preload("permiso"))
    .preload("tipo", (query) => query.preload("atributos"))
    .preload("componente", (query) => query.preload("atributos"))
    .preload("orden")
    .preload("valores", (query) => query.preload("atributo"))
    .preload("sub_conf", (query) => preloadRecursivo(query));
};

const preloadRecursivoMenu = (query) => {
  return query
    .preload("tipo")
    .preload("hijos", (query) => preloadRecursivoMenu(query))
    .preload("rel");
};

const respuestaVacia: respuesta = {
  configuraciones: [],
  opciones: {},
  error: {},
};

const listadoVacio: listado = {
  datos: [{}],
  cabeceras: [{}],
  filtros: [{}],
  listadoBotones: [{}],
  opciones: {},
  error: { message: "" },
};

export interface respuesta {
  configuraciones: any[];
  opciones: {};
  error: {};
}

export default class ConfigsController {
  public async Config(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;

    const config = request.qs().pantalla;
    const usuario = await auth.authenticate();
    const id = request.body().id;
    const queryFiltros = request.qs();
    if (!config) {
      return listadoVacio;
    }
    const conf = await SConf.query()
      .where("id_a", config)
      .preload("conf_permiso", (query) => query.preload("permiso"))
      .preload("tipo", (query) => query.preload("atributos"))
      .preload("componente", (query) => query.preload("atributos"))
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => preloadRecursivo(query))
      .firstOrFail();
    ctx.$_conf.estructura = conf;
    // para listado
    if (!(await bouncer.allows("AccesoConf", conf))) return listadoVacio;

    if (conf.tipo.id === 2) {
      //  console.log("pidio Listado");
      try {
        return ConfBuilder.armarListado(
          ctx,
          conf,
          conf,
          bouncer,
          queryFiltros,
          id,
          usuario,
          "n"
        );
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (conf.tipo.id === 6) {
      // console.log("pidio Vista");
      try {
        return ConfBuilder.armarVista(ctx, conf, id, conf, bouncer, usuario);
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (conf.tipo.id === 7) {
      // console.log("Pidio contenedor", config.id_a);
      return await ConfBuilder.armarContenedor({
        ctx,
        contenedor: conf,
        idListado: id,
        idVista: id,
      });
    }
    if (conf.tipo.id === 9) {
      //  console.log("pidioABM", conf.id_a);
      return ConfBuilder.armarABM({ ctx, conf, abm: conf });
    }
  }

  public async ConfigPantalla(ctx: HttpContextContract) {
    try {
      const { request, bouncer, auth } = ctx;
      ctx.primer_request = true;
      const config = request.params().pantalla;
      const usuario = await auth.authenticate();

      const id_a_solicitados = request.body();

      const id = id_a_solicitados.id;

      const queryFiltros = request.qs(); // siempre undefined porque pasamos todo por post

      if (!config) {
        return respuestaVacia;
      }
      const conf = await SConf.query()
        .where("id_a", config)
        .andWhere("id_tipo", 1)
        .preload("conf_permiso", (query) => query.preload("permiso"))
        .preload("tipo", (query) => query.preload("atributos"))
        .preload("componente", (query) => query.preload("atributos"))
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      // console.log(conf.toJSON());

      ctx.$_conf.estructura = conf;
      // para listado
      if (!(await bouncer.allows("AccesoConf", conf))) {
        //  console.log("No hay acceso a ", conf.id_a, conf.permiso);

        return ctx.response.unauthorized({
          error: { message: "Sin Autorizacion" },
        });
      }

      const listados = conf.sub_conf.filter(
        (sc) => sc.tipo.id === 2
      ) as SConf[];
      const vistas = conf.sub_conf.filter((sc) => sc.tipo.id === 6) as SConf[];
      const abms = conf.sub_conf.filter((sc) => sc.tipo.id === 9) as SConf[];

      const artesanales = conf.sub_conf.filter(
        (sc) => sc.tipo.id === 11
      ) as SConf[];

      const contenedores = conf.sub_conf.filter(
        (sc) => sc.tipo.id === 7
      ) as SConf[];

      ctx.$_respuesta = respuestaVacia;

      const listadosArmados = await Promise.all(
        listados.map(async (listado) => {
          let solo_conf = "s";
          if (listado.getAtributo({ atributo: "iniciar_activo" }) === "s") {
            solo_conf = "n";
          }
          return await ConfBuilder.armarListado(
            ctx,
            listado,
            conf,
            bouncer,
            queryFiltros,
            id_a_solicitados.id,
            usuario,
            solo_conf
          );
        })
      );

      const vistasArmadas = await Promise.all(
        vistas.map(async (vista) => {
          return ConfBuilder.armarVista(ctx, vista, id, conf, bouncer, usuario);
        })
      );

      const contenedoresArmadas = await Promise.all(
        contenedores.map(async (contenedor) =>
          ConfBuilder.armarContenedor({
            ctx,
            idVista: id,
            idListado: id,
            contenedor,
          })
        )
      );

      const abmsArmados = await Promise.all(
        abms.map(async (abm) => {
          return ConfBuilder.armarABM({ ctx, conf, abm });
        })
      );

      const artesanalesArmados = await Promise.all(
        artesanales.map(async (art) => {
          return ConfBuilder.armarArtesanal({ ctx, conf, art, id });
        })
      );

      ctx.$_respuesta.opciones = ConfBuilder.setOpciones(ctx, conf, conf, id);

      let configuraciones: any[] = [];
      configuraciones = configuraciones.concat(listadosArmados);
      configuraciones = configuraciones.concat(vistasArmadas);
      configuraciones = configuraciones.concat(contenedoresArmadas);
      configuraciones = configuraciones.concat(abmsArmados);
      configuraciones = configuraciones.concat(artesanalesArmados);

      ctx.$_respuesta.configuraciones = configuraciones.filter(
        (c) => c.opciones.tipo
      );
      ctx.$_respuesta.error = ctx.$_errores[0]?.error;
      ctx.$_respuesta.sql = (await ctx.bouncer.allows(
        "AccesoRuta",
        Permiso.GET_SQL
      ))
        ? ctx.$_sql
        : undefined;

      return ctx.$_respuesta;
    } catch (err) {
      console.log("ConfigController.ConfigPantalla", err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async ABM_put(ctx: HttpContextContract) {
    const { request, response, bouncer } = ctx;
    const config = request.params().config;

    const id = request.body().id;
    const formData = request.body();

    if (!config) {
      return respuestaVacia;
    }

    const conf = await SConf.query()
      .where("id_a", config)
      .andWhere("id_tipo", 1)
      .preload("conf_permiso", (query) => query.preload("permiso"))
      .preload("componente", (query) => query.preload("atributos"))
      .preload("tipo", (query) => query.preload("atributos"))
      .preload("orden")
      .preload("valores", (query) => query.preload("atributo"))
      .preload("sub_conf", (query) => preloadRecursivo(query))
      .firstOrFail();

    ctx.$_conf.estructura = conf;

    if (!(await bouncer.allows("AccesoConf", conf)))
      return response.status(409);

    if (id) return;
    if (!id) {
      await insertarABM(ctx, formData, conf);
    }

    return "GUARDASTE CAPO";
  }

  public async Update(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const { valor, update_id, id_a } = request.body();

    try {
      const usuario = await auth.authenticate();

      const config = await SConf.query()
        .where("id_a", id_a)
        .preload("conf_permiso", (query) => query.preload("permiso"))
        .preload("componente", (query) => query.preload("atributos"))
        .preload("tipo", (query) => query.preload("atributos"))
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      if (!config) return "No hay tal configuracion";

      if (!(await bouncer.allows("AccesoConf", config, acciones.modificar)))
        return "No tiene permisos para esta config";

      const res = await modificar(ctx, update_id, valor, config, usuario);

      if (res?.modificado) {
        return response.accepted(res?.registroModificado);
      }
      return response.badRequest(res);
    } catch (err) {
      console.log("CONTROLLER", err);
      return err;
    }
  }

  public async Insert(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const { valor, insert_ids, id_a } = request.body();

    try {
      const usuario = await auth.authenticate();
      const config = await SConf.query()
        .where("id_a", id_a)
        .preload("conf_permiso", (query) => query.preload("permiso"))
        .preload("componente", (query) => query.preload("atributos"))
        .preload("tipo", (query) => query.preload("atributos"))
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      if (!config) return "No hay tal configuracion";

      if (!(await bouncer.allows("AccesoConf", config, acciones.alta)))
        return "No tiene permisos para esta config";

      const res = await insertar(ctx, valor, insert_ids, config, usuario);

      if (res?.creado || res?.modificado) {
        return response.accepted(
          res.registroCreado ? res.registroCreado : res.registroModificado
        );
      }
      return response.badRequest(res);
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public async Delete(ctx: HttpContextContract) {
    const { request, response, bouncer, auth } = ctx;
    const { id_a, delete_id } = request.body();

    try {
      const usuario = await auth.authenticate();
      const config = await SConf.query()
        .where("id_a", id_a)
        .preload("conf_permiso")
        .preload("componente", (query) => query.preload("atributos"))
        .preload("tipo", (query) => query.preload("atributos"))
        .preload("orden")
        .preload("valores", (query) => query.preload("atributo"))
        .preload("sub_conf", (query) => preloadRecursivo(query))
        .firstOrFail();

      if (!config) return "No hay tal configuracion";

      if (!(await bouncer.allows("AccesoConf", config, acciones.baja)))
        return "No tiene permisos para esta config";

      const res = await eliminar(ctx, delete_id, config, usuario);

      if (res?.eliminado) {
        return response.accepted(res?.registroEliminado);
      }
      return response.badRequest(res);
    } catch (err) {
      console.log(err);
      return response.badRequest({ error: err });
    }
  }

  public async Menu(ctx: HttpContextContract) {
    const menu = ctx.request.body().menu;
    try {
      const _Menu = await Menu.query()
        .where("id_a", menu?.trim())
        .preload("hijos", (query) =>
          preloadRecursivoMenu(query.orderBy("orden", "asc"))
        )
        .firstOrFail();

      _Menu.serialize({
        relations: {
          hijos: {
            relations: {
              rel: {
                fields: ["orden", "id_menu_item_hijo"],
              },
            },
          },
        },
      });

      let __Menu = _Menu.hijos.map((h) => h.toJSON());

      const ordenarHijos = async (m) => {
        //varifico la institucion
        if (m.institucion === "s") {
          m.laod("institucion");
        }
        //verificamos permisos aca?

        if (m.permiso === "n") {
          return undefined;
        }

        if (m.permiso === "u") {
          if (!ctx.auth.isLoggedIn) {
            return undefined;
          }
        }

        if (m.permiso === "p" && !(await ctx.bouncer.allows("AccesoMenu", m))) {
          return undefined;
        }

        if (m.hijos.length === 0) {
          delete m.rel;
          delete m.hijos;
          return m;
        }

        m.hijos = await Promise.all(
          m.hijos.map(async (h) => {
            h.orden = m.rel.find((r) => r.id_menu_item_hijo === h.id).orden;

            return await ordenarHijos(h);
          })
        );

        m.hijos = m.hijos
          .sort((a, b) => {
            if (a.orden > b.orden) {
              return 1;
            }
            if (a.orden < b.orden) {
              return -1;
            }
            // a must be equal to b
            return 0;
          })
          .filter((m) => m);

        delete m.rel;

        return m;
      };

      const MenuDefinitivo = (
        await Promise.all(__Menu.map(async (m) => await ordenarHijos(m)))
      ).filter((m) => m);

      return MenuDefinitivo;
    } catch (err) {
      console.log("MENU ERROR: --------------------------", Date.now(), err);

      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async Excel(ctx: HttpContextContract) {
    const { request: req } = ctx;

    const { conf: id_a, filtros, id } = req.body();
    const conf = await getConf(id_a);

    let confArmada: any = {};

    try {
      switch (conf.id_tipo) {
        case 2:
          confArmada = await ConfBuilder.armarListado(
            ctx,
            conf,
            conf,
            ctx.bouncer,
            filtros,
            id,
            ctx.auth.user,
            "n",
            true // excel
          );
          break;
        case 6:
          confArmada = await ConfBuilder.armarVista(
            ctx,
            conf,
            id,
            conf,
            ctx.bouncer,
            ctx.auth.user,
            true
          );
          break;
      }

      const excelExport = confArmada.cabeceras
        .filter((c) => c.excel_export === "s")
        .pop();
      const csvData = confArmada.datos.map((d) => {
        return d[excelExport.id_a + "_excel_export_formato"];
      });

      let separador = excelExport.excel_export_separador;
      if (separador == "TAB") separador = "\t";

      // Cabeceras de csv
      let csvCabeceras = [];
      if (excelExport.excel_con_cabecera === "s") {
        if (confArmada.datos[0][excelExport.id_a + "_excel_export_cabeceras"]) {
          csvCabeceras =
            confArmada.datos[0][
              excelExport.id_a + "_excel_export_cabeceras"
            ].split(",");
        }

        if (
          !confArmada.datos[0][excelExport.id_a + "_excel_export_cabeceras"] &&
          excelExport.excel_export_cabeceras
        ) {
          csvCabeceras = excelExport.excel_export_cabeceras.split(",");
        }
        if (
          !confArmada.datos[0][excelExport.id_a + "_excel_export_cabeceras"] &&
          !excelExport.excel_export_cabeceras
        ) {
          csvCabeceras = csvData[0]
            .split(separador)
            .map((_d, i) => "Col " + (i + 1));
        }
      }

      //extension de archivo
      const ext = ".".concat(
        confArmada.datos[0][excelExport.id_a + "_excel_export_ext"] ??
          excelExport.excel_export_ext ??
          "csv"
      );

      //separador de csv

      // nombre de archivo
      let nombre =
        confArmada.datos[0][excelExport.id_a + "_excel_export_nombre"] ??
        excelExport.excel_export_nombre ??
        id_a;

      // Escribir archivo
      const filePath = await writeLog(
        csvData,
        csvCabeceras,
        nombre,
        ext,
        separador,
        ctx
      );
      // Leer el archivo
      const file = await fs.promises.readFile(filePath);

      // Codificar el archivo en Base64
      const file64 = file.toString("base64");

      //elimina el archivo
      fs.unlink(filePath, () => {});

      return ctx.response.type("application/json").send({
        conf: confArmada,
        excel: {
          archivo: file64,
          nombre: nombre + ext,
        },
      });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(ctx, err);
    }
  }

  public async generarQR(ctx: HttpContextContract) {
    const { request: req, response } = ctx;

    const {
      id,
      sup,
      inf,
      link,
      file_name,
      fondo = "negro",
      cantidad = 1,
    } = req.body().data;
    id;
    try {
      const imagenBuffer = await generarQR(
        link,
        sup.toUpperCase(),
        inf.toUpperCase(),
        "./public/logocfsf2-1-v.png",
        fondo,
        cantidad
      );
      // Crear un nombre de archivo único, por ejemplo, usando un timestamp
      const nombreArchivo = `qr_${Date.now()}.png`;

      // Ruta completa al archivo
      const rutaCompleta = path.join(__dirname, nombreArchivo);

      // Escribir el buffer en el archivo
      fs.writeFileSync(rutaCompleta, imagenBuffer);

      // Establecer las cabeceras de respuesta para la descarga
      response.header(
        "content-disposition",
        `attachment; filename=QR_${file_name}`
      );
      response.type("image/png");

      // Enviar el archivo como respuesta
      response.send(imagenBuffer);

      // Eliminar el archivo después de enviarlo
      fs.unlinkSync(rutaCompleta);
      // Responde con el buffer de la imagen

      return ctx.response.type("image/png").send(imagenBuffer);
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(ctx, err);
    }
  }
}

export const getConf = async (id_a: string, tipo?: number) => {
  const conf_sin_valores = await SConf.query()
    .where("id_a", id_a)
    .if(tipo, (query) => query.andWhere("id_tipo", tipo as any))
    .preload("conf_permiso", (query) => query.preload("permiso"))
    .preload("tipo")
    .preload("componente")
    .preload("orden")
    .preload("permiso_string")
    // .preload("valores", async (query) => {
    //   query.orderBy("id_conf_cpsc", "desc");
    //   query.preload("atributo");
    // })
    .preload("sub_conf", async (query) => {
      // query.select("id");
      preloadRecursivo(query);
    })
    .firstOrFail();

  await getValores(conf_sin_valores, null);
  return conf_sin_valores;
};

export const getValores = async (conf, _orden) => {
  await conf.load("valores", (query) => {
    // const id_conf_cpsc = _orden?.filter((c) => c.id_conf_h === conf.id).pop().id;

    query.preload("atributo");
    // query
    //   .if(id_conf_cpsc, (query) =>
    //     query.whereRaw(
    //       `id_conf = ${conf.id} and ((id_conf_cpsc IS NULL and id_tipo_atributo not in ( select id_tipo_atributo from s_conf_tipo_atributo_valor where id_conf = ${conf.id} and id_conf_cpsc = ${id_conf_cpsc} )) or id_conf_cpsc = ${id_conf_cpsc})`
    //     )
    //   )
    //   .if(!id_conf_cpsc, (query) =>
    //     query.whereRaw(`id_conf = ${conf.id} and id_conf_cpsc IS NULL`)
    //   );
    return query;
  });

  if (conf.sub_conf.length > 0) {
    await Promise.all(
      conf.sub_conf.map(async (sc) => {
        await getValores(sc, conf.orden);
      })
    );
  }
  return conf;
};

const writeLog = async (
  data: string[],
  cabeceras: string[],
  name: string,
  ext: string,
  separador: string,
  ctx: HttpContextContract
) => {
  const folderPath = path.join(__dirname, "log");

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const filePath = path.join(folderPath, name + ext);

  try {
    function appendLogToCsv(filePath, data, cabeceras) {
      return new Promise<void>((resolve, reject) => {
        const stream = fs.createWriteStream(filePath);

        if (cabeceras.length > 0) {
          let cabecerasString = cabeceras.toString();
          if (separador)
            cabecerasString = cabecerasString.replace(/,/g, separador);
          stream.write(cabecerasString + "\n");
        }

        data.forEach((l: string) => {
          let linea = l;
          if (separador) linea = l.replace(/,/g, separador);
          stream.write(linea + "\n");
        });

        stream.end();

        stream.on("finish", () => {
          resolve();
        });

        stream.on("error", (error) => {
          reject(error);
        });
      });
    }
    await appendLogToCsv(filePath, data, cabeceras);
    return filePath;
  } catch (err) {
    console.log(err);
    return await new ExceptionHandler().handle(err, ctx);
  }
};
