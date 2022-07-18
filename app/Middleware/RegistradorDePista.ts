import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class RegistradorDePista {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const acceso = {
      usuario: ctx.usuario.id,
      usuario_nombre: ctx.usuario.nombre,
      url: ctx.request.url(),
      configuracion: ctx.request.param("pantalla"),
    };
    console.log(acceso);
    await next();
  }
}
