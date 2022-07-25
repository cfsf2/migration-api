import { getAtributo } from "./configuraciones";
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

import { guardarDatosAuditoria, AccionCRUD } from "./funciones";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;
let SConfCpsc = SCC;
let Usuario = U;
let SConfConfUsuario = SCCU;
let SConfConfDeta = SCCD;

export class Insertar {
  constructor() {}

  public static async insertar({ ctx, valor, insert_ids, conf, usuario }) {
    try {
      let tabla = conf.getAtributo({ atributo: "insert_tabla" });
      if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

      let modelo = eval(getAtributo({ atributo: "insert_modelo", conf }));
      if (!modelo)
        modelo = eval(getAtributo({ atributo: "update_modelo", conf }));

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
        objeto[campo] = valor;

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
      console.log(err);
      return { registroCreado: err, creado: false, error: err.message };
    }
  }

  public static async insertarSConfConfUsuario({
    ctx,
    valor,
    insert_ids,
    conf,
    usuario,
  }) {
    try {
      let tabla = conf.getAtributo({ atributo: "insert_tabla" });
      if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

      let modelo = eval(getAtributo({ atributo: "insert_modelo", conf }));
      if (!modelo)
        modelo = eval(getAtributo({ atributo: "update_modelo", conf }));

      let campos = getAtributo({ atributo: "insert_campos", conf });
      let campo = getAtributo({ atributo: "insert_campo", conf });
      if (!campo) campo = getAtributo({ atributo: "update_campo", conf });

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

      if (!SCCU[0]) {
        console.log(
          "No  hay SCCU",
          ctx.usuario.id,
          insert_idsArray[camposArray.indexOf("id_conf_madre")]
        );
        const SCCU_nuevo = new SConfConfUsuario();
        SCCU_nuevo.merge({
          id_usuario: ctx.usuario.id,
          id_conf: insert_idsArray[camposArray.indexOf("id_conf_madre")],
        });
      }

      const SCCD = new SConfConfDeta();
      SCCD.merge({
        id_conf: insert_idsArray[camposArray.indexOf("id_conf")],
        id_conf_conf_usuario: SCCU[0].id,
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

        let modelo = eval(getAtributo({ atributo: "insert_modelo", conf }));
        if (!modelo)
          modelo = eval(getAtributo({ atributo: "update_modelo", conf }));

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
      throw err;
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

export default Insertar;
