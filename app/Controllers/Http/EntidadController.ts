import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { eliminarKeysVacios } from "App/Helper/funciones";
import Entidad from "../../Models/Entidad";

export default class EntidadController {
  public async index({ request }: HttpContextContract) {
    return await Entidad.traerEntidades();
  }

  public async mig_agregar_entidad({ request }: HttpContextContract) {
    const nuevaEntidad = new Entidad();

    nuevaEntidad.merge({
      imagen: request.body().imagen,
      logo: request.body().logo,
      habilitado: request.body().habilitado === true ? "s" : "n",
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
    nuevaEntidad.save();
    //console.log(nuevaEntidad.save())
    return;
  }

  public async mig_update_entidad({ request }: HttpContextContract) {
    const { id } = request.qs();
    console.log(request.qs());

    let entidad = await Entidad.findOrFail(id);

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
}
