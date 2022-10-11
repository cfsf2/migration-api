import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Usuario from "App/Models/Usuario";
import { enumaBool } from "App/Helper/funciones";
import Perfil from "App/Models/Perfil";
import { DateTime } from "luxon";
import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";

export default class AuthController {
  public async mig_loginwp(ctx: HttpContextContract) {
    try {
      const { request, auth, bouncer } = ctx;
      const { username, password } = request.only(["username", "password"]);

      console.log(username, password);
      const log = await auth
        .use("api")
        .attempt(username, password, { expiresIn: "24h" });

      let response = log.user.toObject();
      response = enumaBool(response);

      const usuario = await Usuario.query()
        .where("usuario", username)
        .preload("perfil", (query) => {
          query.preload("permisos");
        });

      usuario[0].f_ultimo_acceso = DateTime.now()
        .setLocale("es-Ar")
        .toFormat("yyyy-MM-dd hh:mm:ss");
      await usuario[0].save();

      response.permisos = Array.from(
        new Set(usuario[0].perfil[0]?.permisos.map((p) => p.tipo))
      );
      response.user_display_name = usuario[0].give_user_display_name();

      response.user_rol = [usuario[0].perfil[0]?.tipo];
      response.user_email = response.email;

      response.token = log.token;

      // await bouncer.authorize("esAdmin", usuario[0]);
      return response;
    } catch (error) {
      console.log(error);
      throw new ExceptionHandler().handle(error, ctx);
    }
  }

  public async mig_perfiles({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PERFILES_GET);

      const { tipo } = request.qs();
      return await Perfil.query()
        .select("tbl_perfil.id as _id", "tbl_perfil.*")
        .where("tipo", tipo)
        .preload("permisos");
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler();
    }
  }

  public async checkToken(ctx: HttpContextContract) {
    try {
      console.log("checking token");
      return (await ctx.auth.check())
        ? ctx.response.accepted({ message: "El token es valido" })
        : ctx.response.conflict({ message: "El token es invalido" });
    } catch (err) {
      console.log(err);
      return ctx.response.conflict({ message: "El token es invalido" });
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout();
    return response.redirect("/");
  }
}
