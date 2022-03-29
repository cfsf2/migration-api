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
}
