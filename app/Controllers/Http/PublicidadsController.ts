import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Publicidad from "../../Models/Publicidad";
import Database from "@ioc:Adonis/Lucid/Database";

export default class PublicidadsController {
  public async index({ request }: HttpContextContract) {
    return Publicidad.traerPublicidades();

    // return await Publicidad.query()
    //   .preload("instituciones")
    //   .preload("juancito")
    //   .select("*")
    //   .where("id_publicidad_tipo", "=", "1");
  }
}
