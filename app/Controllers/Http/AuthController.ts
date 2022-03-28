import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import jwt from "jsonwebtoken";
import Usuario from "App/Models/Usuario";

export default class AuthController {
  public async mig_loginwp({ request, response, auth }: HttpContextContract) {
    const { username, password } = request.only(["username", "password"]);

    try {
      await auth.attempt(username, password);
      const usuario = await Usuario.query().where("usuario", username);
      usuario[0].user_display_name = usuario[0].give_user_display_name();

      const response = usuario[0];
      response.token = jwt.sign({ user: usuario }, process.env.JWTSECRET, {
        expiresIn: process.env.JWTEXPIRESIN,
      });
      response.user_email = response.email;
      usuario[0].f_ultimo_acceso = new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", "");
      return response;
    } catch (error) {
      console.log(error);
      response.send(error);
    }
  }

  public async mig_alta_usuario({
    request,
    response,
    auth,
  }: HttpContextContract) {
    const body = request.body();
    const token = request.header("authentication");

    const nuevoUsuario = {
      usuario: body.usuario,
      nombre: body.name,
      apellido: body.apellido,
      email: body.email,
      telefono: body.caracteristica + body.telefono,
      celular: body.caracteristica + body.telefono,
      password: body.password,
    };
    try {
      Usuario.registrarUsuarioWeb(nuevoUsuario);
    } catch (error) {
      console.log(error);
      return response.send(error);
    }

    return nuevoUsuario;
  }

  public async logout({ response, auth }: HttpContextContract) {
    await auth.logout();
    return response.redirect("/");
  }
}
