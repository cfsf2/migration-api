import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import Usuario from "App/Models/Usuario";
import { getAtributo } from "./configuraciones";
import { guardarDatosAuditoria, AccionCRUD } from "./funciones";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;

export class Update {
  constructor() {}

  public static async update({
    usuario,
    id,
    valor,
    conf,
  }: {
    usuario: Usuario;
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

    if (modelo && campo) {
      const registro = await eval(modelo).findOrFail(id);

      registro.merge({
        [campo]: valor,
      });

      try {
        guardarDatosAuditoria({
          usuario,
          objeto: registro,
          accion: AccionCRUD.editar,
        });
        await registro.save();
        return { registroModificado: registro.toJSON(), modificado: true };
      } catch (err) {
        console.log(err);
        return { registroModificado: err, modificado: false };
      }
    }

    if (!modelo && tabla && campo && id) {
      try {
        const registro = await Database.rawQuery(
          `UPDATE ${tabla} SET ${campo} = ${valor}, id_usuario_modificacion = ${
            usuario.id
          } WHERE ${columna ? columna : "id"} = ${id}`
        );
        return { registroModificado: registro, modificado: true };
      } catch (err) {
        return {
          registroModificado: err,
          modificado: false,
        };
      }
    }
  }

  public static async updateYMensajear({}: {
    usuario: Usuario;
    id: any;
    valor: string | number;
    conf: SConf;
  }) {
    try {
      console.log("MENSAJE MENSAJE");
      console.log("MENSAJE MENSAJE");
      console.log("MENSAJE MENSAJE");
      console.log("MENSAJE MENSAJE");
      console.log("MENSAJE MENSAJE");

      return {
        registroModificado: { mensaje: "Aca no pasa nada muchacho" },
        modificado: true,
      };
    } catch (err) {
      console.log(err);
      return { registroModificado: err, modificado: false };
    }
  }
}

export default Update;
