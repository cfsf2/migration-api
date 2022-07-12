import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class UsuarioPermiso {
  public async handle(
    { auth, request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    if (typeof auth.user !== "undefined")
      auth.user.Permisos = await auth.user?._Permisos();

    global.$_usuario = auth.user;
    global.$_filtros = request.qs();

    await next();
  }
}
