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

export class Eliminar {
  constructor() {}

  public static async eliminar({ ctx, delete_id, conf, usuario }) {
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
