import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Usuario from "App/Models/Usuario";
import { enumaBool } from "App/Helper/funciones";

export default class AuthController {
  public async mig_loginwp({ request, response, auth }: HttpContextContract) {
    const { username, password } = request.only(["username", "password"]);

    try {
      let response = await auth.use("web").attempt(username, password);
      response = enumaBool(response);

      const usuario = await Usuario.query()
        .where("usuario", username)
        .preload("perfil", (query) => {
          query.preload("permisos");
        });

      usuario[0].f_ultimo_acceso = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
      await usuario[0].save();

      response.permisos = Array.from(
        new Set(usuario[0].perfil[0].permisos.map((p) => p.tipo))
      );
      response.user_display_name = usuario[0].give_user_display_name();

      //const response = usuario[0];

      response.user_rol = [usuario[0].perfil[0].tipo];
      response.user_email = response.email;

      response.token = jwt.sign(
        { user: response.toObject() },
        process.env.JWTSECRET,
        {
          expiresIn: process.env.JWTEXPIRESIN,
        }
      );

      return response;
    } catch (error) {
      console.log(error);
      response.send(error);
    }
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout();
    return response.redirect("/");
  }
}
