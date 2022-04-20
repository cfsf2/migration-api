import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
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
      mostrar_en_proveeduria: request.body().no_mostrar_en_proveeduria ? request.body().no_mostrar_en_proveeduria === true ? "s" : "n" : "s",
    })

    console.log(request.body())
    nuevaEntidad.save()

     //console.log(nuevaEntidad.save())
     return
  }
}
