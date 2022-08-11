import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import U from "App/Models/Usuario";
import SCC from "App/Models/SConfCpsc";
import SCCU from "App/Models/SConfConfUsuario";
import SCCD from "App/Models/SConfConfDeta";

import { getAtributo } from "./configuraciones";
import { guardarDatosAuditoria, AccionCRUD } from "./funciones";
import { validator, schema, rules } from "@ioc:Adonis/Core/Validator";
import ExceptionHandler from "App/Exceptions/Handler";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { BaseModel } from "@ioc:Adonis/Lucid/Orm";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;
let SConfCpsc = SCC;
let Usuario = U;
let SConfConfUsuario = SCCU;
let SConfConfDeta = SCCD;

export class Update {
  constructor() {}

  public static async update({
    ctx,
    usuario,
    id,
    valor,
    conf,
    formData,
  }: {
    ctx: HttpContextContract;
    usuario: U;
    id: any;
    valor: string | number;
    conf: SConf;
    formData?: {};
  }) {
    if (conf.tipo.id === 9)
      return this.updateABM({ ctx, formData: ctx.request.body(), conf });

    const tabla = getAtributo({ atributo: "update_tabla", conf: conf });
    const modelo = getAtributo({ atributo: "update_modelo", conf: conf });
    const campo = getAtributo({ atributo: "update_campo", conf: conf });
    const columna = getAtributo({
      atributo: "update_id_nombre",
      conf: conf,
    });
    const registrarCambios = getAtributo({
      atributo: "update_registro_cambios",
      conf: conf,
    });

    if (modelo && campo) {
      try {
        const registro = await eval(modelo).findOrFail(id);
        const valorAnterior = registro[campo];

        registro.merge({
          [campo]: valor,
        });

        guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.editar,
          registroCambios: {
            registrarCambios,
            tabla,
            campo,
            valorAnterior,
          },
        });
        await registro.save();
        return { registroModificado: registro.toJSON(), modificado: true };
      } catch (err) {
        console.log("update error", err);
        throw await new ExceptionHandler().handle(err, ctx);
      }
    }

    if (!modelo && tabla && campo && id) {
      const s = "`";

      try {
        const registro = await Database.rawQuery(
          `UPDATE ${tabla} SET ${s
            .concat(campo)
            .concat(s)} = '${valor}', id_usuario_modificacion = ${
            usuario.id
          } WHERE ${columna ? columna : "id"} = ${id}`
        );
        return { registroModificado: registro, modificado: true };
      } catch (err) {
        throw await new ExceptionHandler().handle(err, ctx);
      }
    }
  }

  public static async archivo({
    ctx,
    conf,
  }: {
    ctx: HttpContextContract;
    conf: SConf;
  }) {
    try {
      const maxSize = conf.getAtributo({ atributo: "archivo_tamano_maximo" });

      const carpeta = conf.getAtributo({ atributo: "archivo_carpeta" });

      const formatos_permitidos = conf
        .getAtributo({
          atributo: "archivo_formatos_permitidos",
        })
        ?.split(",")
        .map((c) => c.trim());

      const convencion_nombre = conf.getAtributo({
        atributo: "archivo_convencion_nombre",
      });

      const archivo = ctx.request.file("archivo", {
        size: maxSize,
        extnames: formatos_permitidos,
      });

      if (!archivo || !archivo.isValid)
        throw await new ExceptionHandler().handle(archivo?.errors[0], ctx);

      const archivoNombre = `${ctx.request
        .body()
        .update_id.toString()}-${Date.now()}.${archivo.extname}`;

      await archivo.moveToDisk(
        `${carpeta}/`,
        {
          name: archivoNombre,
          contentType:
            archivo.extname === "pdf"
              ? "application/pdf"
              : "binary/octet-stream",
          cacheControl: "no-cache",
          visibility: "public",
        },
        "s3"
      );

      return this.update({
        ctx,
        usuario: ctx.usuario,
        id: ctx.request.body().update_id,
        valor: `${carpeta}/${archivoNombre}`,
        conf,
      });
    } catch (err) {
      console.log(err);
      throw await new ExceptionHandler().handle(err, ctx);
    }
  }

  public static async updateABM({
    ctx,
    formData,
    conf,
  }: {
    ctx: HttpContextContract;
    formData: Record<string, any>;
    conf: SConf;
  }) {
    try {
      const funcion = getAtributo({ atributo: "update_funcion", conf: conf });

      if (funcion)
        return await this[funcion]({
          ctx,
          formData,
          conf,
        });

      const tabla = getAtributo({ atributo: "tabla", conf: conf });
      const Modelo = eval(
        getAtributo({ atributo: "modelo", conf: conf })
      ) as typeof BaseModel;

      const registro = await Modelo.findOrFail(ctx.$_id_general);

      await Promise.all(
        Object.keys(formData).map(async (id_a) => {
          const configuracion = await SConf.findByIda({ id_a });
          if (!configuracion)
            return { message: `Error no encuentro esta configuracion ${id_a}` };

          const campo = getAtributo({
            atributo: "update_campo",
            conf: configuracion,
          });

          const registrarCambios = getAtributo({
            atributo: "update_registro_cambios",
            conf: configuracion,
          });

          const valorAnterior = registro[campo];

          guardarDatosAuditoria({
            usuario: ctx.usuario,
            objeto: registro,
            accion: AccionCRUD.editar,
            registroCambios: {
              registrarCambios,
              tabla,
              campo,
              valorAnterior,
            },
          });

          // condiciones de la configuracion para guardar //
          /*
          /*
          /*
          /**/

          registro.merge({
            [campo]: formData[id_a],
          });
        })
      );

      await registro.save();
      return { registroModificado: registro.toJSON(), modificado: true };
    } catch (err) {
      console.log(err);
      throw await new ExceptionHandler().handle(err, ctx);
    }
  }

  public static async password({
    ctx,
    usuario,
    id,
    valor,
    conf,
  }: {
    ctx: HttpContextContract;
    usuario: U;
    id: any;
    valor: string | number;
    conf: SConf;
  }) {
    const tabla = getAtributo({ atributo: "update_tabla", conf: conf });
    const modelo = getAtributo({ atributo: "update_modelo", conf: conf });
    const campo = getAtributo({ atributo: "update_campo", conf: conf });
    const columna = getAtributo({
      atributo: "update_id_nombre",
      conf: conf,
    });
    const registrarCambios = getAtributo({
      atributo: "update_registro_cambios",
      conf: conf,
    });
    const passMin = getAtributo({ atributo: "pass_mininimo", conf: conf })
      ? getAtributo({ atributo: "pass_mininimo", conf: conf })
      : 6;
    const passMax = getAtributo({ atributo: "pass_maximo", conf: conf })
      ? getAtributo({ atributo: "pass_maximo", conf: conf })
      : 100;
    const reqMay =
      getAtributo({ atributo: "pass_req_mayuscula", conf: conf }) === "n"
        ? ".*.*"
        : ".*[A-Z].*";
    const reqNumero =
      getAtributo({ atributo: "pass_req_numero", conf: conf }) === "s"
        ? ".*[0-9].*"
        : ".*.*";

    if (modelo && campo) {
      try {
        const registro = await eval(modelo).findOrFail(id);
        const valorAnterior = registro[campo];

        await validator.validate({
          schema: schema.create({
            [campo]: schema.string([
              rules.trim(),
              rules.minLength(Number(passMin)),
              rules.maxLength(Number(passMax)),
              rules.regex(new RegExp(reqMay)),
              rules.regex(new RegExp(reqNumero)),
            ]),
          }),
          data: {
            [campo]: valor,
          },
        });

        registro.merge({
          [campo]: valor,
        });

        guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.editar,
          registroCambios: {
            registrarCambios,
            tabla,
            campo,
            valorAnterior,
          },
        });
        await registro.save();
        return { registroModificado: registro.toJSON(), modificado: true };
      } catch (err) {
        console.log("update error", err);
        throw await new ExceptionHandler().handle(err, ctx);
      }
    }

    if (!modelo && tabla && campo && id) {
      const s = "`";

      try {
        const registro = await Database.rawQuery(
          `UPDATE ${tabla} SET ${s
            .concat(campo)
            .concat(s)} = '${valor}', id_usuario_modificacion = ${
            usuario.id
          } WHERE ${columna ? columna : "id"} = ${id}`
        );
        return { registroModificado: registro, modificado: true };
      } catch (err) {
        throw await new ExceptionHandler().handle(err, ctx);
      }
    }
  }

  public static async error() {
    try {
      throw new Error("Nada de esto fue un error");
    } catch (err) {
      return {
        registroCreado: "Esto ha sido un error",
        creado: false,
        error: err.message,
      };
    }
  }
}

export default Update;
