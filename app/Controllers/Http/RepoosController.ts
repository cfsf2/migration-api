import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Repoo from "App/Models/Repoo";

import { Permiso } from "App/Helper/permisos";

export default class RepoossController {
  public async index({ bouncer }) {
    await bouncer.authorize("AccesoRuta", Permiso.REPORTEOOSS_GET);
    const repooss = await Repoo.query();
    return repooss
      .map((rep) => {
        rep.oossInactivas = JSON.parse(rep.oossInactivas);
        return rep;
      })
      .pop();
  }

  public async update({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.REPORTEOOSS_CREATE);
    return Repoo.actualizar({ data: request.body(), file: request.file });
  }
}
