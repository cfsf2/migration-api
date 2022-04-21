import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { eliminarKeysVacios } from "App/Helper/funciones";
import Publicidad from "App/Models/Publicidad";
import Entidad from "../../Models/Entidad";

export default class EntidadController {
  public async index({ request }: HttpContextContract) {
    return await Entidad.traerEntidades({ habilitado : 'true'});
  }

  public async mig_agregar_entidad({ request }: HttpContextContract) {
    const nuevaEntidad = new Entidad();

    nuevaEntidad.merge({
      imagen: request.body().imagen,
      logo: request.body().logo,
      habilitado: request.body().habilitado = 's',
      email: request.body().email,
      nombre: request.body().entidadnombre, //entidadnombre
      titulo: request.body().nombre, //nombre
      rentabilidad: request.body().rentabilidad,
      mostrar_en_proveeduria: request.body().no_mostrar_en_proveeduria
        ? request.body().no_mostrar_en_proveeduria === true
          ? "s"
          : "n"
        : "s",
    });

    try {
      nuevaEntidad.save();
      return nuevaEntidad;
    } catch (error) {
      return error;
    }
  }

  public async mig_update_entidad({ request }: HttpContextContract) {
    const { id } = request.qs();

    let entidad = await Entidad.findOrFail(id);
    console.log(request.body().habilitado)
    let mergeObject: any = {
      imagen: request.body().imagen,
      logo: request.body().logo,
      habilitado:
        typeof request.body().habilitado !== "undefined"
          ? request.body().habilitado === true
            ? "s"
            : "n"
          : null,
      email: request.body().email,
      nombre: request.body().entidadnombre, //entidadnombre
      titulo: request.body().nombre, //nombre
      rentabilidad: request.body().rentabilidad,
      mostrar_en_proveeduria:
        typeof request.body().no_mostrar_en_proveeduria !== "undefined"
          ? request.body().no_mostrar_en_proveeduria === true
            ? "s"
            : "n"
          : null,
    };
    mergeObject = eliminarKeysVacios(mergeObject);

    entidad.merge(mergeObject);

    try {
      entidad.save();
      return entidad;
    } catch (error) {
      return error;
    }
  }

  public async mig_delete({ request }: HttpContextContract) {
    const { id } = request.params();

    let entidad = await Entidad.findOrFail(id);
    
    entidad.merge({
      habilitado: request.body().habilitado = 'n'
    });

    entidad.save();
    
    try {
      return entidad;
    } catch (error) {
      return error;
    }
  }
}
