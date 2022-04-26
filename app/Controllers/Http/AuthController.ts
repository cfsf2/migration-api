import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Usuario from "App/Models/Usuario";
import { enumaBool } from "App/Helper/funciones";
import Perfil from "App/Models/Perfil";
import { DateTime } from "luxon";

export default class AuthController {
  public async mig_loginwp({ request, response, auth }: HttpContextContract) {
    const { username, password } = request.only(["username", "password"]);

    try {
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
        new Set(usuario[0].perfil[0].permisos.map((p) => p.tipo))
      );
      response.user_display_name = usuario[0].give_user_display_name();

      response.user_rol = [usuario[0].perfil[0].tipo];
      response.user_email = response.email;

      response.token = log.token;

      // jwt.sign(
      //   { user: response.toObject() },
      //   process.env.JWTSECRET,
      //   {
      //     expiresIn: process.env.JWTEXPIRESIN,
      //   }
      // );

      return response;
    } catch (error) {
      console.log(error);
      response.send({
        statusCode: 500,
        body: { message: error.responseText },
      });
    }
  }

  public async mig_perfiles({ request }: HttpContextContract) {
    const { tipo } = request.qs();
    return await Perfil.query()
      .select("tbl_perfil.id as _id", "tbl_perfil.*")
      .where("tipo", tipo)
      .preload("permisos");
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout();
    return response.redirect("/");
  }
}
