import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Repoo from "App/Models/Repoo";
import Drive from "@ioc:Adonis/Core/Drive";

export default class RepoossController {
  public async index() {
    const repooss = await Repoo.query();
    return repooss
      .map((rep) => {
        rep.oossInactivas = JSON.parse(rep.oossInactivas);
        return rep;
      })
      .pop();
  }

  public async update({ request }: HttpContextContract) {
    return Repoo.actualizar({ data: request.body(), file: request.file });
  }
}
