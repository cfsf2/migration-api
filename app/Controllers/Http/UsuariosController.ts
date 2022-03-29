import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Usuario from "App/Models/Usuario";
import Mail from "@ioc:Adonis/Addons/Mail";

import { generarHtml } from "../../Helper/email";

export default class UsuariosController {
  public async index({ request }: HttpContextContract) {
    const { page = 1, limit = 30 } = request.qs();

    return await Usuario.query()
      .select("*")
      .orderBy("apellido", "asc")
      .paginate(page, limit);
  }

  public async mig_perfilUsuario({ request }: HttpContextContract) {
    const { usuarioNombre } = request.params();
    console.log(usuarioNombre);
    return Usuario.traerPerfilDeUsuario({ usuarioNombre });
    // return Usuario.query().where("usuario", usuarioNombre.toString());
  }

  public async mig_alta_usuario({ request, response }: HttpContextContract) {
    const body = request.body();

    const nuevoUsuario = {
      usuario: body.usuario,
      nombre: body.name,
      apellido: body.apellido,
      email: body.email,
      fecha_nac: body.fecha_nac,
      dni: body.dni,
      telefono: body.caracteristica + body.telefono,
      celular: body.caracteristica + body.telefono,
      password: body.password,
    };

    const res = await Usuario.registrarUsuarioWeb(nuevoUsuario, response);
    if (response.getStatus() === 201) {
      Mail.send((message) => {
        message
          .from("farmageoapp@gmail.com")
          .to(nuevoUsuario.email)
          .subject("Bienvenido " + nuevoUsuario.nombre + " a FarmaGeo")
          .html(
            generarHtml({
              titulo: "Bienvenido a Farmageo",
              // imagen: '',
              texto: `Usted se ha registrado correctamente! <br/> Su usuario es: <strong>${body.usuario}</strong><br/> Su contraseña es: <strong>${body.password}</strong>`,
              span: `Encontra tu Farmacia mas cercana`,
              linkspan: "https://app.farmageo.com.ar/#/",
            })
          );
      });
    }
    return response.send(res);
  }
}
