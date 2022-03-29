import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import Usuario from "App/Models/Usuario";

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
      telefono: body.caracteristica + body.telefono,
      celular: body.caracteristica + body.telefono,
      password: body.password,
    };

    const res = await Usuario.registrarUsuarioWeb(nuevoUsuario, response);
    console.log(res);
    return response.send(res);
  }
}
