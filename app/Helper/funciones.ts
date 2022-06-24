import Database from "@ioc:Adonis/Lucid/Database";
import SConf from "App/Models/SConf";
import Usuario from "App/Models/Usuario";
import axios from "axios";
import { getAtributo } from "./configuraciones";

export const cambiarKey = ({
  o,
  oldKey,
  newKey,
}: {
  o: any;
  oldKey: string;
  newKey: string;
}) => {
  delete Object.assign(o, { [newKey]: o[oldKey] })[oldKey];
};

export const enumaBool = (e) => {
  const claves = Object.keys(e);
  claves.forEach((k) => {
    if (e[k] === "s") {
      e[k] = true;
    }
    if (e[k] === "n") {
      e[k] = false;
    }
  });

  return e;
};

export const boolaEnum = (e) => {
  if (e === true || e === "true") return "s";
  if (e === false || e === "false") return "n";
  return e;
};

export const boolaEnumObj = (e) => {
  const claves = Object.keys(e);
  claves.forEach((k) => {
    e[k] = boolaEnum(e[k]);
  });

  return e;
};

export const getCoordenadas = ({
  calle,
  numero,
  localidad,
  provincia = "Santa Fe",
  pais = "Argentina",
}: {
  calle: string;
  numero: number;
  localidad: string;
  provincia?: string;
  pais?: string;
}): Promise<{ lat: string; lng: string }> => {
  return new Promise(async (resolve, reject) => {
    const direccioncompleta = `${calle} ${numero}, ${localidad}, ${provincia}, ${pais}`;
    const geocoding = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${direccioncompleta}&key=${process.env.GEOCODING_API}`
    );

    resolve(geocoding.data.results[0].geometry.location);
  });
};

export const eliminarKeysVacios = (mergObject) =>
  Object.fromEntries(Object.entries(mergObject).filter(([_, v]) => v != null));

export enum AccionCRUD {
  crear = "crear",
  editar = "editar",
}

export interface GuardarDatosAuditoria {
  usuario: Usuario;
  objeto: any;
  accion: AccionCRUD;
}

export const guardarDatosAuditoria = ({
  usuario,
  objeto,
  accion,
}: GuardarDatosAuditoria) => {
  console.log(usuario);
  switch (accion) {
    case AccionCRUD.crear:
      objeto.merge({
        id_usuario_creacion: usuario.id,
        id_usuario_modificacion: usuario.id,
      });
      break;

    case AccionCRUD.editar:
      objeto.merge({
        id_usuario_modificacion: usuario.id,
      });
      break;

    default:
      break;
  }
};

export const arrayPermisos = async (usuario) => {
  const perfiles = await usuario.related("perfil").query().preload("permisos");

  let permisosUsuario: any = [];

  perfiles.forEach((perfil) => {
    perfil.permisos.forEach((permiso) => permisosUsuario.push(permiso));
  });
  return permisosUsuario;
};

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

  public static async updateYMensajear({
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

        console.log("MENSAJE MENSAJE");
        console.log("MENSAJE MENSAJE");
        console.log("MENSAJE MENSAJE");
        console.log("MENSAJE MENSAJE");
        console.log("MENSAJE MENSAJE");
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
}
