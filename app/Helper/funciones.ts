import Usuario from "App/Models/Usuario";
import SRc from "App/Models/SRc";
import SRcDeta from "App/Models/SRcDeta";
import axios from "axios";
import { DateTime } from "luxon";

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
  baja = "baja",
}

export interface GuardarDatosAuditoria {
  usuario: Usuario;
  objeto: any;
  accion: AccionCRUD;
  registroCambios?: {
    registrarCambios: string;
    campo?: string;
    tabla?: string;
    valorAnterior?: any;
  };
}

export const guardarDatosAuditoria = async ({
  usuario,
  objeto,
  accion,
  registroCambios,
}: GuardarDatosAuditoria) => {
  switch (accion) {
    case AccionCRUD.crear:
      objeto.merge({
        id_usuario_creacion: usuario.id,
        id_usuario_modificacion: usuario.id,
      });
      break;

    case AccionCRUD.editar:
      try {
        if (
          typeof registroCambios?.registrarCambios === "string" &&
          registroCambios?.registrarCambios.trim() === "s"
        ) {
          if (
            !registroCambios.campo ||
            !registroCambios.tabla ||
            !registroCambios.valorAnterior
          )
            return;

          const rc = new SRc();
          await rc
            .merge({
              id_registro: objeto.id,
              tabla: registroCambios.tabla,
              id_usuario: usuario.id,
            })
            .save();

          const rc_deta = new SRcDeta();
          rc_deta
            .merge({
              id_rc: rc.id,
              campo: registroCambios.campo,
              valor: registroCambios.valorAnterior,
            })
            .save();
          // console.log(rc, rc_deta);
        }
        objeto.merge({
          id_usuario_modificacion: usuario.id,
        });
      } catch (err) {
        console.log(err);
        return err;
      }
      break;

    case AccionCRUD.baja:
      if (
        typeof registroCambios?.registrarCambios === "string" &&
        registroCambios?.registrarCambios.trim() !== "s"
      )
        return console.log(
          "no debe guardar",
          registroCambios?.registrarCambios
        );

      if (!registroCambios?.tabla || !registroCambios?.valorAnterior) return;

      const rc = new SRc();

      try {
        await rc
          .merge({
            id_registro: objeto.id,
            tabla: registroCambios.tabla,
            id_usuario: usuario.id,
          })
          .save();

        Object.keys(objeto.$original).forEach((k) => {
          const rc_deta = new SRcDeta();

          if (DateTime.isDateTime(objeto[k])) {
            objeto[k] = objeto[k].toFormat("yyyy-LL-dd HH:mm:ss");
          }
          rc_deta
            .merge({
              id_rc: rc.id,
              campo: k,
              valor: objeto[k],
            })
            .save();
        });
      } catch (err) {
        console.log(err);
        return err;
      }

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
