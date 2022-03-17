import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Farmacia from "../../Models/Farmacia";

export default class FarmaciasController {
  public async index({ request }: HttpContextContract) {
    const { page = 1, limit = 10 } = request.qs();
    return await Farmacia.query()
      .select("tbl_farmacia.nombre as fombre", "tbl_usuario.usuario as usu")
      .leftJoin("tbl_usuario", "tbl_farmacia.id_usuario", "tbl_usuario.id")
      .orderBy("tbl_farmacia.id", "asc")
      .paginate(page, limit);
  }
}
