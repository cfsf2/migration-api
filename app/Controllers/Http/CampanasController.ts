import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Campana from "App/Models/Campana";
import CampanaRequerimiento from "App/Models/CampanaRequerimiento";

export default class CampanasController {
  public async index() {
    return await Campana.query();
  }

  public async activas({ request }: HttpContextContract) {
    const { idUsuario, habilitado } = request.params();
    return await Campana.query()
      .preload("orientados")
      .preload("atributos")
      .apply((scopes) => scopes.forUser({ idUsuario: idUsuario }))
      .apply((scopes) => scopes.habilitado(habilitado))
      .apply((scopes) => scopes.vigente());
  }
}
