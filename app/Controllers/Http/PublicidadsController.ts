import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Publicidad from "../../Models/Publicidad";
import Database from "@ioc:Adonis/Lucid/Database";

export default class PublicidadsController {
  public async index({ request }: HttpContextContract) {
    const query = await Database.from("tbl_publicidad as p")
      .select(
        "p.*",
        "tp.nombre as tipo",
        "cp.nombre as color",
        Database.raw("GROUP_CONCAT(i.id) as instituciones")
      )
      .leftJoin(
        "tbl_publicidad_tipo as tp",
        "tp.id",
        "=",
        "p.id_publicidad_tipo"
      )
      .leftJoin("tbl_publicidad_color as cp", "cp.id", "=", "p.id_color")
      .leftJoin(
        "tbl_publicidad_institucion as ip",
        "ip.id_publicidad",
        "=",
        "p.id"
      )
      .leftJoin("tbl_institucion as i", "ip.id_institucion", "=", "i.id")
      .groupBy("p.id");

    return await Publicidad.query()
      .preload("instituciones")
      .preload("tipo")
      .select("*")
      .where("id_publicidad_tipo", "=", "1");
  }
}
