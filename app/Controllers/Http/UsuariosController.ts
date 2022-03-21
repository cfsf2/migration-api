import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Usuario from "App/Models/Usuario";

export default class UsuariosController {
  public async index({ request }: HttpContextContract) {
    const { page = 1, limit = 30 } = request.qs();

    return await Usuario.query()
      .select("*")
      .orderBy("apellido", "asc")
      .paginate(page, limit);
  }

  public async pass({ request }: HttpContextContract) {
    return { data: "Metodo passsss" };
  }
}
