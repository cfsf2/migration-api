import { getAtributo } from "./configuraciones";
import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import Usuario from "App/Models/Usuario";

import { guardarDatosAuditoria, AccionCRUD } from "./funciones";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;

export class Insertar {
  constructor() {}

  public static insertar({ valores, conf, usuario }) {
    let tabla = conf.getAtributo({ atributo: "insert_tabla" });
    if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

    let modelo = getAtributo({ atributo: "insert_modelo", conf });
    if (!modelo) modelo = getAtributo({ atributo: "update_modelo", conf });

    let campos = getAtributo({ atributo: "insert_campos", conf });
    let camposArray = campos.split("|").map((c) => c.trim());

    const valoresArray = valores.split("|").map((v) => v.trim());

    if (modelo && valoresArray.length === 0) {
      const objeto = {};
      valores.forEach((v, i) => (objeto[campos[i]] = v));
    }
    if (tabla && valores.length !== "") {
      try {
        Database.raw(
          `INSERT IGNORE INTO ${tabla} (${campos.replace(
            "|",
            ","
          )}) VALUES (${valores.replace("|", ",")})`
        );
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  }
}

export default Insertar;
