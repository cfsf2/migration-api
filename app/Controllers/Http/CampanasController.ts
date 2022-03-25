import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Campana from "App/Models/Campana";

export default class CampanasController {
  public async index() {
    return await Campana.query();
  }

  public async activas({ request }: HttpContextContract) {
    const { idUsuario } = request.params();
    return await Campana.query().preload("orientados").preload("atributos");
  }
}
