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

  public static async insertar({ valor, valores, conf, usuario }) {
    let tabla = conf.getAtributo({ atributo: "insert_tabla" });
    if (!tabla) tabla = getAtributo({ atributo: "update_tabla", conf });

    let modelo = eval(getAtributo({ atributo: "insert_modelo", conf }));
    if (!modelo)
      modelo = eval(getAtributo({ atributo: "update_modelo", conf }));

    let campos = getAtributo({ atributo: "insert_campos", conf });
    let campo = getAtributo({ atributo: "campo", conf });
    let camposArray = campos.split("|").map((c) => c.trim());

    const valoresArray = valores.split("|").map((v) => v.trim());

    if (modelo && valoresArray.length === 0) {
      const objeto = {};
      objeto[campo] = valor;
      valores.forEach((v, i) => (objeto[camposArray[i]] = v));

      try {
        const registro = new modelo();

        registro.merge(objeto);

        guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.crear,
        });

        await registro.save();

        return { registroCreado: registro.toJSON(), creado: true };
      } catch (err) {
        console.log(err);
        return { registroCreado: err, creado: false };
      }
    }
    if (tabla && valores.length !== "") {
      try {
        const registro = await Database.rawQuery(
          `INSERT IGNORE INTO ${tabla} (${campos.replace(
            "|",
            ","
          )}) VALUES (${valores.replace("|", ",")})`
        );
        return { registroCreado: registro.toJSON(), creado: true };
      } catch (err) {
        console.log(err);
        return { registroCreado: err, creado: false };
      }
    }
  }
}

export default Insertar;
