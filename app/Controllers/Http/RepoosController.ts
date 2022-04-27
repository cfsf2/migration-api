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

  public async update({
    request,
    bouncer,
    response,
    auth,
  }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.REPORTEOOSS_CREATE);
    const usuario = await auth.authenticate();

    try {
      return Repoo.actualizar({
        auth: usuario,
        data: request.body(),
        file: request.file("file", {
          extnames: ["pdf"],
        }),
      });
    } catch (err) {
      return response.status(409).send(err);
    }
  }
}
