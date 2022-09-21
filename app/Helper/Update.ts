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

import R from "App/Models/Recupero";
import RD from "App/Models/RecuperoDiagnostico";
import RE from "App/Models/RecuperoEstadio";
import RLT from "App/Models/RecuperoLineaTratamiento";
import RPS from "App/Models/RecuperoPerformanceStatus";
import DGN from "App/Models/Diagnostico";
import ESTD from "App/Models/Estadio";
import LT from "App/Models/LineaTratamiento";
import PS from "App/Models/PerformanceStatus";
import M from "App/Models/Monodro";
import STipoAtributo from "App/Models/STipoAtributo";
import SComponente from "App/Models/SComponente";

let Recupero = R;
let RecuperoDiagnostico = RD;
let RecuperoEstadio = RE;
let RecuperoLineaTratamiento = RLT;
let RecuperoPerformanceStatus = RPS;
let Diagnostico = DGN;
let Estadio = ESTD;
let LineaTratamiento = LT;
let PerformanceStatus = PS;
let Monodro = M;

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

        return { registroModificado: registro, modificado: true };
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
        throw await new ExceptionHandler().handle(
          {
            code: archivo?.errors[0].type,
            message: archivo?.errors[0].message,
          },
          ctx
        );

      const archivoNombre = (() => {
        if (!convencion_nombre)
          return `${ctx.request.body().update_id}-${Date.now()}`;

        let an = convencion_nombre;

        const nombres = convencion_nombre.split("-");

        if (nombres.includes("update_id") && ctx.request.body().update_id) {
          an = an.replace("update_id", ctx.request.body().update_id.toString());
        }
        if (nombres.includes("id") && ctx.$_id_general) {
          an = an.replace("id", ctx.$_id_general.toString());
        }
        if (nombres.includes("timestamp")) {
          an = an.replace("timestamp", Date.now().toString());
        }
        if (nombres.includes("tabla")) {
          an = an.replace(
            "tabla",
            conf.getAtributo({ atributo: "update_tabla" })
          );
        }

        return an.concat(`.${archivo.extname}`);
      })();

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

      return await Update.update({
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

  public static async habilitarRecupero({
    ctx,
    conf,
    id,
    usuario,
  }: {
    ctx: HttpContextContract;
    conf: SConf;
    usuario: U;
    id: number;
  }) {
    const tabla = getAtributo({ atributo: "update_tabla", conf: conf });
    const Modelo = eval(
      getAtributo({ atributo: "update_modelo", conf: conf })
    ) as typeof BaseModel;
    const campo = getAtributo({ atributo: "update_campo", conf: conf });
    const columna = getAtributo({
      atributo: "update_id_nombre",
      conf: conf,
    });
    const registrarCambios = getAtributo({
      atributo: "update_registro_cambios",
      conf: conf,
    });

    if (Modelo && campo) {
      try {
        const registro = await Modelo.findOrFail(id);

        const recuperoDiagnosticos = await RecuperoDiagnostico.findBy(
          "id_recupero",
          registro.$primaryKeyValue
        );

        if (!recuperoDiagnosticos) {
          registro.merge({
            habilitado: "n",
          });
          await registro.save();
          throw {
            code: "recupero_sin_diagnostico",
          };
        }

        const valorAnterior = registro[campo];

        const valor = valorAnterior === "s" ? "n" : "s";

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

    if (!Modelo && tabla && campo && id) {
      const s = "`";

      try {
        const registro = await Database.query().from(tabla).where("id", id);
        const registroM = await Database.rawQuery(
          `UPDATE ${tabla} SET ${s.concat(campo).concat(s)} = '${
            registro[campo] === "s" ? "n" : "s"
          }', id_usuario_modificacion = ${usuario.id} WHERE ${
            columna ? columna : "id"
          } = ${id}`
        );
        return { registroModificado: registroM, modificado: true };
      } catch (err) {
        throw await new ExceptionHandler().handle(err, ctx);
      }
    }
  }

  public static async sconf_cambio_componente({
    ctx,
    conf,
    id,
    usuario,
  }: {
    ctx: HttpContextContract;
    conf: SConf;
    usuario: U;
    id: number;
  }) {
    try {
      const tabla = getAtributo({ atributo: "update_tabla", conf: conf });

      const campo = getAtributo({ atributo: "update_campo", conf: conf });

      const registrarCambios = getAtributo({
        atributo: "update_registro_cambios",
        conf: conf,
      });
      const body = ctx.request.body();
      const Componente = await SComponente.findOrFail(body.valor);

      const Sconf = await SConf.query()
        .where("id", id)
        .preload("tipo")
        .preload("componente");

      if (Sconf[0].tipo.tiene_componente === "n")
        throw new Error("SCONF_NO_COMPONENT");

      const Registro = await SConfTipoAtributoValor.query()
        .whereIn("id_tipo_atributo", [11, 21, 145, 176, 191])
        .andWhere("id_conf", id);

      // Crea s_conf_tipo_atributo_valor de atributo->"componente"
      if (Registro.length === 0 && Componente) {
        const newRegistro = new SConfTipoAtributoValor();

        const id_tipo_atributo = await STipoAtributo.query()
          .where("id_tipo", Sconf[0].tipo.id)
          .andWhere("id_atributo", 5);

        newRegistro.merge({
          valor: Componente.nombre,
          id_tipo_atributo: id_tipo_atributo[0].id,
          id_conf: Sconf[0].id,
        });
        guardarDatosAuditoria({
          usuario,
          objeto: newRegistro,
          accion: AccionCRUD.crear,
          registroCambios: {
            registrarCambios,
            tabla,
            campo,
            valorAnterior: null,
          },
        });
        await newRegistro.save();

        return await Update.update({
          ctx,
          conf,
          id,
          usuario,
          valor: ctx.request.body().valor,
        });
      }

      // actualiza s_conf_tipo_atributo_valor con nombre de componente nuevo
      const valorAnterior = Registro[0].valor;
      Registro[0].merge({
        valor: Componente.nombre,
      });
      guardarDatosAuditoria({
        usuario,
        objeto: Registro[0],
        accion: AccionCRUD.editar,
        registroCambios: {
          registrarCambios,
          tabla,
          campo,
          valorAnterior,
        },
      });
      Registro[0].save();

      return await Update.update({
        ctx,
        conf,
        id,
        usuario,
        valor: ctx.request.body().valor,
      });
    } catch (err) {
      console.log(err);
      throw await new ExceptionHandler().handle(
        {
          code: "SCONF_NO_COMPONENT",
        },
        ctx
      );
    }
  }
}

export default Update;
