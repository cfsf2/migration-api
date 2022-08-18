import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SPista from "App/Models/SPista";
import SConf from "App/Models/SConf";

export default class RegistradorDePista {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    if (ctx.usuario?.id) {
      if (!ctx.request.param("pantalla")) return await next();

      const pista = new SPista();

      const id_conf = (
        await SConf.findBy("id_a", ctx.request.param("pantalla"))
      )?.id;

      const values = {
        url: ctx.request.url(),

        qs: ctx.request.qs(),
        body: ctx.request.body(),
      };

      pista.merge({
        id_usuario: ctx.usuario.id,
        id_conf: id_conf,
        values: JSON.stringify(values),
      });
      pista.save();
    }
    await next();
  }
}
