import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class RegistradorDePista {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    if (ctx.usuario.id) {
      const acceso = {
        usuario: ctx.usuario?.id,
        usuario_nombre: ctx.usuario?.nombre,
        url: ctx.request.url(),
        pantalla: ctx.request.param("pantalla"),
        filtros: ctx.request.qs(),
      };
      console.log(acceso);
    }
    await next();
  }
}
