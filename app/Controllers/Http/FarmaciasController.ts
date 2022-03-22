import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Farmacia from "../../Models/Farmacia";

export default class FarmaciasController {
  public async index() {
    return await Farmacia.query()
      .preload("servicios", (servicio) => {
        servicio.where("tbl_servicio.habilitado", "s");
      })
      .preload("localidad");
  }

  public async mig_index() {
    return await Farmacia.traerFarmacias();
  }

  public async mig_perfil({ request }: HttpContextContract) {
    return await Farmacia.traerFarmacias(request.params().usuario);
  }
}
