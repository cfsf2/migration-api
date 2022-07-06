import { getAtributo } from "./configuraciones";
import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import Usuario from "App/Models/Usuario";
import SCC from "App/Models/SConfCpsc";

import { guardarDatosAuditoria, AccionCRUD } from "./funciones";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;
let SConfCpsc = SCC;

export class Insertar {
  constructor() {}

  public static async insertar({ valor, insert_ids, conf, usuario }) {
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

      try {
        const registro = new modelo();

        registro.merge(objeto);

        guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.crear,
        });

        await registro.save();

        return { registroCreado: registro, creado: true };
      } catch (err) {
        console.log(err);
        return { registroCreado: err, creado: false };
      }
    }
    if (!modelo && tabla && insert_ids !== "") {
      try {
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
      } catch (err) {
        console.log(err);
        return { registroCreado: err, creado: false, error: err.message };
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

export default Insertar;
