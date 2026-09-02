import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Repoo from "App/Models/Repoo";

import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";

export default class RepoossController {
  public async index({ bouncer }) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.REPORTEOOSS_GET);
      const repooss = await Repoo.query();
      return repooss
        .map((rep) => {
          rep.oossInactivas = JSON.parse(rep.oossInactivas);
          return rep;
        })
        .pop();
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async update({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.REPORTEOOSS_CREATE);
      const usuario = await auth.authenticate();

      return Repoo.actualizar({
        auth: usuario,
        data: request.body(),
        file: request.file("file", {
          extnames: ["pdf"],
        }),
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
