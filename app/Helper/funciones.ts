import Usuario from "App/Models/Usuario";
import axios from "axios";

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
    switch (accion) {
      case AccionCRUD.crear:
        objeto.merge({
          id_usuario_creacion: usuario.id,
          id_usuario_modificacion: usuario.id,
        });
        break;

      case AccionCRUD.editar:
        objeto.merge({
          id_usuario_modificaicon: usuario.id,
        });
        break;

      default:
        break;
    }
  };
