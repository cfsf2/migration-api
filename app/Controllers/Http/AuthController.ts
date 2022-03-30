import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Usuario from "App/Models/Usuario";

export default class AuthController {
  public async mig_loginwp({ request, response, auth }: HttpContextContract) {
    const { username, password } = request.only(["username", "password"]);

    try {
      await auth.use("web").attempt(username, password);
      const usuario = await Usuario.query().where("usuario", username);
      usuario[0].f_ultimo_acceso = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");

      await usuario[0].save();
      usuario[0].user_display_name = usuario[0].give_user_display_name();

      const response = usuario[0];
      response.token = jwt.sign({ user: usuario }, process.env.JWTSECRET, {
        expiresIn: process.env.JWTEXPIRESIN,
      });
      response.user_email = response.email;

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
