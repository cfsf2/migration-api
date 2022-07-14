import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UsuarioPermiso {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (typeof ctx.auth.user !== "undefined")
      ctx.auth.user.Permisos = await ctx.auth.user?._Permisos();

    ctx.$_filtros = {
      solicitados: {},
      filtrosObligatorios: [],
    };
    ctx.$_filtros.solicitados = ctx.request.qs();

    await next();
  }
}
