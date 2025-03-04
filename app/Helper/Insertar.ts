import { getAtributo } from "./configuraciones";
import { guardarDatosAuditoria, AccionCRUD, _log } from "./funciones";
import ExceptionHandler from "App/Exceptions/Handler";
import { BaseModel } from "@ioc:Adonis/Lucid/Orm";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SComponente from "App/Models/SComponente";

import * as M from "./ModelIndex";

import Datab from "@ioc:Adonis/Lucid/Database";
import U from "./Update";

import D from "./Eliminar";

import SConf from "App/Models/SConf";

import SCCU from "App/Models/SConfConfUsuario";
import SCCD from "App/Models/SConfConfDeta";

let SConfConfUsuario = SCCU;
let SConfConfDeta = SCCD;

const Database = Datab;
let Update = U;
let Eliminar = D;

SComponente;
Update;
Eliminar;

export class Insertar {
  constructor() {}

  public static async insertarExplicito({ ctx, conf }) {
    const {  insert_ids } = ctx.request.body();
    let db = getAtributo({ atributo: "db", conf });
    if (!db) {
      const modeloString =
        getAtributo({ atributo: "insert_modelo", conf }) ??
        getAtributo({ atributo: "update_modelo", conf });
      const modelo = M[modeloString];
      db = modelo.connection ?? "mysql";
    }

    const insert_campos = getAtributo({
      atributo: "insert_campos",
      conf,
    }).split("|");

    const insert_values = insert_ids.split("|");

    const tabla =
      getAtributo({ atributo: "insert_tabla", conf }) ??
      getAtributo({ atributo: "update_tabla", conf });

    try {
      const database = Database.connection(db);
      let res = await database.rawQuery(
        `insert into ${tabla} (${insert_campos.join(
          ","
        )}, id_usuario_creacion) VALUES (${insert_values.join(",")}, ${
          ctx.usuario.id
        })`
      );

      if (res.errno) throw res;

      const registro = {
        id: res[0].insertId,
      };
      return { registroModificado: registro, registroCreado: registro, creado: true, modificado: true };
    } catch (err) {
      console.log("error en insertarExplicito");
      throw err;
    }
  }

  public static async insertar({ ctx, valor, insert_ids, conf, usuario }) {
    if (conf.tipo.id === 9)
      return this.insertarABM({ ctx, formData: ctx.request.body(), conf });

    try {
      let tabla = conf.getAtributo({ atributo: "insert_tabla" });
      if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

      let modelo = M[getAtributo({ atributo: "insert_modelo", conf })];
      if (!modelo) modelo = M[getAtributo({ atributo: "update_modelo", conf })];

      let campos = getAtributo({ atributo: "insert_campos", conf });
      let campo = getAtributo({ atributo: "insert_campo", conf });
      if (!campo) campo = getAtributo({ atributo: "update_campo", conf });

      let camposArray = campos.split("|").map((c) => c.trim());

      const insert_idsArray = insert_ids
        .toString()
        .split("|")
        .map((v) => v.trim());

      if (modelo && insert_idsArray.length > 0) {
        const objeto = {};
        if (campo) {
          objeto[campo] = valor;
        }

        insert_idsArray.forEach((v, i) => (objeto[camposArray[i]] = v));

        const registro = new modelo();

        registro.merge(objeto);

        guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.crear,
        });
        await registro.save();

        return { registroCreado: registro, creado: true };
      }
      if (!modelo && tabla && insert_ids !== "") {
        const onDuplicateUpdate = (() => {
          let duplicateUpdate = "";
          camposArray.forEach((c, i) => {
            duplicateUpdate = duplicateUpdate.concat(
              `${c} = ${insert_idsArray[i]},`
            );
          });
          duplicateUpdate = duplicateUpdate.concat(`${campo} = ${valor}`);
          return duplicateUpdate;
        })();

        const registro = await Database.rawQuery(
          `INSERT IGNORE INTO ${tabla} (${campos.replace(
            "|",
            ","
          )}, ${campo}) VALUES (${insert_ids.replace("|", ",")}, ${valor}) 
          ON DUPLICATE KEY UPDATE
          ${onDuplicateUpdate}
          `
        );
        return { registroCreado: registro, creado: true };
      }
    } catch (err) {
      console.log("this is err:", err);
      return { registroCreado: err, creado: false, error: err.message };
    }
  }

  public static async insertarABM({
    ctx,
    formData,
    conf,
  }: {
    ctx: HttpContextContract;
    formData: { id?: number };
    conf: SConf;
  }) {
    try {
      let tabla = conf.getAtributo({ atributo: "tabla" });
      tabla;
      let Modelo = M[
        getAtributo({ atributo: "modelo", conf })
      ] as typeof BaseModel;

      if (formData.id) {
        return await U.updateABM({ ctx, formData, conf });
      }

      // console.log(formData);

      const nuevoRegistro = new Modelo();

      await Promise.all(
        Object.keys(formData).map(async (id_a) => {
          const confCampo = await SConf.findByIda({ id_a });

          if (!confCampo)
            return { message: `Error no encuentro esta configuracion ${id_a}` };

          const campo = getAtributo({
            atributo: "update_campo",
            conf: confCampo,
          });

          const insert_campos = getAtributo({
            atributo: "insert_campos",
            conf: confCampo,
          });

          insert_campos?.split("|").forEach((i) => {
            nuevoRegistro.merge({ [i]: formData[i] });
          });

          const componente = getAtributo({
            atributo: "componente",
            conf: confCampo,
          });

          if (componente === "radio") {
            //console.log("radio");
          }

          nuevoRegistro.merge({ [campo]: formData[id_a] });
        })
      );

      await nuevoRegistro.save();
      return { registroCreado: nuevoRegistro, creado: true };
    } catch (err) {
      console.log(err);
      throw await new ExceptionHandler().handle(err, ctx);
    }
  }
  public static async _insertarABM({
    ctx,
    formData,
    conf,
  }: {
    ctx: HttpContextContract;
    formData: { id?: number };
    conf: SConf;
  }) {
    try {
      let tabla = conf.getAtributo({ atributo: "tabla" });
      tabla;
      let Modelo = M[
        getAtributo({ atributo: "modelo", conf })
      ] as typeof BaseModel;

      if (formData.id) {
        return await U.updateABM({ ctx, formData, conf });
      }

      // console.log(formData);

      const nuevoRegistro = new Modelo();

      await Promise.all(
        Object.keys(formData).map(async (id_a) => {
          const confCampo = await SConf.findByIda({ id_a });

          if (!confCampo)
            return { message: `Error no encuentro esta configuracion ${id_a}` };

          const campo = getAtributo({
            atributo: "update_campo",
            conf: confCampo,
          });

          const insert_campos = getAtributo({
            atributo: "insert_campos",
            conf: confCampo,
          });

          insert_campos?.split("|").forEach((i) => {
            nuevoRegistro.merge({ [i]: formData[i] });
          });

          const componente = getAtributo({
            atributo: "componente",
            conf: confCampo,
          });

          if (componente === "radio") {
            //console.log("radio");
          }

          if (!campo || !formData[id_a]) return;
          nuevoRegistro.merge({ [campo]: formData[id_a] });
        })
      );

      return nuevoRegistro;
    } catch (err) {
      console.log(err);
      throw await new ExceptionHandler().handle(err, ctx);
    }
  }

  public static async insertarSConfConfDeta({
    ctx,
    valor,
    insert_ids,
    conf,
    usuario,
  }) {
    usuario;
    try {
      let tabla = conf.getAtributo({ atributo: "insert_tabla" });
      if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

      let modelo = M[getAtributo({ atributo: "insert_modelo", conf })];
      if (!modelo) modelo = M[getAtributo({ atributo: "update_modelo", conf })];

      let campos = getAtributo({ atributo: "insert_campos", conf });
      let campo = getAtributo({ atributo: "insert_campo", conf });
      if (!campo) campo = getAtributo({ atributo: "update_campo", conf });

      let camposArray = campos.split("|").map((c) => c.trim());

      const insert_idsArray = insert_ids
        .toString()
        .split("|")
        .map((v) => v.trim());

      let SCCU = (
        await SConfConfUsuario.query()
          .where("id_usuario", ctx.usuario.id)
          .andWhere(
            "id_conf",
            insert_idsArray[camposArray.indexOf("id_conf_madre")]
          )
      )[0];

      if (!SCCU) {
        SCCU = new SConfConfUsuario();
        SCCU.merge({
          id_usuario: ctx.usuario.id,
          id_conf: insert_idsArray[camposArray.indexOf("id_conf_madre")],
        });

        await guardarDatosAuditoria({
          usuario: ctx.usuario,
          objeto: SCCU,
          accion: AccionCRUD.crear,
        });

        await SCCU.save();
      }

      const SCCD = new SConfConfDeta();
      SCCD.merge({
        id_conf: insert_idsArray[camposArray.indexOf("id_conf")],
        id_conf_conf_usuario: SCCU.id,
        [campo]: valor,
      });

      await guardarDatosAuditoria({
        usuario: ctx.usuario,
        objeto: SCCD,
        accion: AccionCRUD.crear,
      });

      await SCCD.save();
      return {
        registroCreado: SCCD,
        creado: true,
        error: "",
      };
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        let tabla = conf.getAtributo({ atributo: "insert_tabla" });
        if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

        let modelo = M[getAtributo({ atributo: "insert_modelo", conf })];
        if (!modelo)
          modelo = M[getAtributo({ atributo: "update_modelo", conf })];

        let campos = getAtributo({ atributo: "insert_campos", conf });
        let campo = getAtributo({ atributo: "insert_campo", conf });
        if (!campo) campo = getAtributo({ atributo: "update_campo", conf });

        const registrarCambios = getAtributo({
          atributo: "update_registro_cambios",
          conf: conf,
        });

        let camposArray = campos.split("|").map((c) => c.trim());

        const insert_idsArray = insert_ids
          .toString()
          .split("|")
          .map((v) => v.trim());

        const SCCU = await SConfConfUsuario.query()
          .where("id_usuario", ctx.usuario.id)
          .andWhere(
            "id_conf",
            insert_idsArray[camposArray.indexOf("id_conf_madre")]
          );

        const SCCD = await SConfConfDeta.query()
          .where("id_conf", insert_idsArray[camposArray.indexOf("id_conf")])
          .andWhere("id_conf_conf_usuario", SCCU[0].id);

        const valorAnterior = SCCD[0][campo];

        SCCD[0].merge({
          [campo]: valor,
        });
        guardarDatosAuditoria({
          usuario: ctx.usuario,
          objeto: SCCD[0],
          accion: AccionCRUD.editar,
          registroCambios: {
            registrarCambios,
            tabla,
            campo,
            valorAnterior,
          },
        });
        await SCCD[0].save();
        return { registroModificado: SCCD[0].toJSON(), creado: true };
      }
      console.log(err);
      throw await new ExceptionHandler().handle(err, ctx);
    }
  }

  public static async guardarFiltrosUsuario({
    ctx,
    valor,
    insert_ids,
    conf,
    usuario,
  }) {
    usuario;
    try {
      let tabla = conf.getAtributo({ atributo: "insert_tabla" });
      if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

      let modelo = M[getAtributo({ atributo: "insert_modelo", conf })];
      if (!modelo) modelo = M[getAtributo({ atributo: "update_modelo", conf })];

      let campos = getAtributo({ atributo: "insert_campos", conf });
      let campo = getAtributo({ atributo: "insert_campo", conf });
      if (!campo) campo = getAtributo({ atributo: "update_campo", conf });
      const registrarCambios = getAtributo({
        atributo: "update_registro_cambios",
        conf: conf,
      });

      let camposArray = campos.split("|").map((c) => c.trim());

      const insert_idsArray = insert_ids
        .toString()
        .split("|")
        .map((v) => v.trim());

      // const trx = await Database.transaction();

      let SCCU = (
        await SConfConfUsuario.query()
          .where("id_usuario", ctx.usuario.id)
          .andWhere(
            "id_conf",
            insert_idsArray[camposArray.indexOf("id_conf_madre")]
          )
      )[0];

      if (!SCCU) {
        console.log(
          "No  hay SCCU",
          ctx.usuario.id,
          insert_idsArray[camposArray.indexOf("id_conf_madre")]
        );
        SCCU = new SConfConfUsuario();
        SCCU.merge({
          id_usuario: ctx.usuario.id,
          id_conf: insert_idsArray[camposArray.indexOf("id_conf_madre")],
        });

        await guardarDatosAuditoria({
          usuario: ctx.usuario,
          objeto: SCCU,
          accion: AccionCRUD.crear,
        });

        await SCCU.save();
      }

      await SConfConfDeta.query()
        .where("id_conf_conf_usuario", SCCU.id)
        .delete(); // Limpiando filtros guardados viejos

      await Promise.all(
        Object.keys(valor).map(async (filtro) => {
          const filtroConf = (
            await SConf.query()
              .where("id_a", filtro)
              .preload("valores", (query) => query.preload("atributo"))
          )[0];

          if (!filtroConf || filtroConf.id_tipo !== 3) return;

          const SCCD = new SConfConfDeta();

          // if (filtroConf?.getAtributo({ atributo: "componente" }) === "fecha") {
          //   valor[filtro] = JSON.stringify(valor[filtro]);
          // }

          SCCD.merge({
            [campo]: valor[filtro],
            id_conf: filtroConf.id,
            id_conf_conf_usuario: SCCU.id,
          });
          guardarDatosAuditoria({
            usuario: ctx.usuario,
            objeto: SCCD,
            accion: AccionCRUD.crear,
          });
          try {
            await SCCD.save(); //.useTransaction(trx);
          } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
              const SCCD = await SConfConfDeta.query()
                .where("id_conf", filtroConf.id)
                .andWhere("id_conf_conf_usuario", SCCU.id);

              const valorAnterior = SCCD[0][campo];

              SCCD[0].merge({
                [campo]: valor[filtro],
              });

              guardarDatosAuditoria({
                usuario: ctx.usuario,
                objeto: SCCD[0],
                accion: AccionCRUD.editar,
                registroCambios: {
                  registrarCambios,
                  tabla,
                  campo,
                  valorAnterior,
                },
              });
              await SCCD[0].save(); //.useTransaction(trx);
              return { registroModificado: SCCD[0].toJSON(), creado: true };
            }
            console.log(err);
            throw err;
          }
        })
      );
      return {
        registroCreado: {},
        creado: true,
        error: "",
      };
    } catch (err) {
      console.log(err);
      return err;
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

      return await Insertar.insertar({
        ctx,
        usuario: ctx.usuario,
        insert_ids: ctx.request.body().insert_ids,
        valor: `${carpeta}/${archivoNombre}`,
        conf,
      });
    } catch (err) {
      console.log("Insertar", err);
      throw err; //await new ExceptionHandler().handle(err, ctx);
    }
  }
}

export default Insertar;
