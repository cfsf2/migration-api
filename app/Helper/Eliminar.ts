import { getAtributo } from "./configuraciones";
import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import SCC from "App/Models/SConfCpsc";
import Usuario from "App/Models/Usuario";

import { guardarDatosAuditoria, AccionCRUD } from "./funciones";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;
let SConfCpsc = SCC;

export class Eliminar {
  constructor() {}

  public static async eliminar({ delete_id, conf, usuario }) {
    const modelo = conf.getAtributo({ atributo: "delete_modelo" });
    const tabla = conf.getAtributo({ atributo: "delete_tabla" });
    const delete_id_nombre = conf.getAtributo({ atributo: "delete_id_nombre" });

    const registrarCambios = getAtributo({
      atributo: "update_registro_cambios",
      conf: conf,
    });

    if (!delete_id) throw { message: "No hay delete_id para eliminar" };

    try {
      if (modelo && delete_id) {
        const registro = await eval(modelo).findOrFail(delete_id);

        await guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.baja,
          registroCambios: {
            registrarCambios,
            tabla,
            valorAnterior: registro,
          },
        });

        await registro.delete();

        return { registroEliminado: registro, eliminado: true, error: "" };
      }
      if (!modelo && tabla && delete_id) {
        const registro = await Database.rawQuery(
          `DELETE FROM ${tabla} WHERE ${
            delete_id_nombre ? delete_id_nombre : "id"
          } = ${delete_id}`
        );
        return { registroEliminado: registro, eliminado: true, error: "" };
      }
    } catch (err) {
      console.log(err);
      return { registroEliminado: err, eliminado: false, error: err.message };
    }
  }

  public static async error() {
    try {
      throw new Error("Nada de esto fue un error");
    } catch (err) {
      return {
        registroCreado: "Esto ha sido un error",
        eliminado: false,
        error: err.message,
      };
    }
  }
}

export default Eliminar;
