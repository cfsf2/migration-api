import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SPista from "App/Models/SPista";
import SConf from "App/Models/SConf";
import ExceptionHandler from "App/Exceptions/Handler";

export default class RegistradorDePista {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    try {
      if (ctx.usuario?.id) {
        try {
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
        } catch (err) {
          console.log(err);
          throw await new ExceptionHandler().handle(err, ctx);
        }
      }
      await next();
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
