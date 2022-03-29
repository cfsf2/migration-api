import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Campana from "App/Models/Campana";
import CampanaRequerimiento from "App/Models/CampanaRequerimiento";

export default class CampanasController {
  public async index() {
    return await Campana.query();
  }

  public async activas({ request }: HttpContextContract) {
    const { idUsuario, habilitado } = request.params();
    let campanas = await Campana.query()
      .select(Database.raw("tbl_campana.*, tbl_campana.id as _id"))
      .preload("orientados")
      .preload("atributos")
      .apply((scopes) => scopes.forUser({ idUsuario: idUsuario }))
      .apply((scopes) => scopes.habilitado(habilitado))
      .apply((scopes) => scopes.vigente());
    return campanas;
  }

  public async mig_nuevoReq({ request, response }: HttpContextContract) {
    const { id_campana, id_usuario, id_farmacia, celular, codigo_promo } =
      request.body();

    const requerimiento = new CampanaRequerimiento();

    
    let random = () => {
      return Math.random().toString(36).slice(2,10)
    }
    
    requerimiento.id_campana = id_campana;
    requerimiento.id_usuario = id_usuario;
    requerimiento.id_farmacia = id_farmacia;
    requerimiento.celular = celular;
    requerimiento.codigo_promo = random().toUpperCase();
    ;

    try {
      await requerimiento.save();
      console.log(request.body())
      return response.status(201).send(
        {
          msg: "El Requerimiento se genero con exito",
          codigo: requerimiento.codigo_promo
        }
      )
    } catch (error) {
      console.log(error)
      return response.status(501).send(error);
    }
  }
}
