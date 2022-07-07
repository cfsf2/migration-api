import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import S from "App/Models/Servicio";
import F from "App/Models/Farmacia";
import FS from "App/Models/FarmaciaServicio";
import SCTPV from "App/Models/SConfTipoAtributoValor";
import Usuario from "App/Models/Usuario";
import SCC from "App/Models/SConfCpsc";

import { getAtributo } from "./configuraciones";
import { guardarDatosAuditoria, AccionCRUD } from "./funciones";

let Servicio = S;
let Farmacia = F;
let FarmaciaServicio = FS;
let _SConf = SConf;
let SConfTipoAtributoValor = SCTPV;
let SConfCpsc = SCC;

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
        return {
          registroModificado: {},
          modificado: false,
          error: err.message,
        };
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
        return {
          registroModificado: {},
          modificado: false,
          error: err.message,
        };
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
