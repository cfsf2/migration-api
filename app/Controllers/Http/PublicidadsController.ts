import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Publicidad from "../../Models/Publicidad";
import Database from "@ioc:Adonis/Lucid/Database";

export default class PublicidadsController {
  public async mig_publicidades({ request }: HttpContextContract) {
    return Publicidad.traerPublicidades({});

    // return await Publicidad.query()
    //   .preload("instituciones")
    //   .preload("juancito")
    //   .select("*")
    //   .where("id_publicidad_tipo", "=", "1");
  }
  public async mig_novedadesAdmin({ request }: HttpContextContract) {
    return Publicidad.traerPublicidades({ tipo: 'novedadesadmin' });
  }
}
