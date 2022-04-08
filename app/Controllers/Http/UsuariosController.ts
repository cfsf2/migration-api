import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
import Usuario from "App/Models/Usuario";
import Mail from "@ioc:Adonis/Addons/Mail";

import { generarHtml } from "../../Helper/email";
import { enumaBool } from "App/Helper/funciones";
import UsuarioPerfil from "App/Models/UsuarioPerfil";

export default class UsuariosController {
  public async index({ request }: HttpContextContract) {
    const usuarios = await Usuario.query()
      .select("*")
      .orderBy("apellido", "asc");

    return usuarios.map((u) => enumaBool(u.toObject()));
  }

  public async mig_perfilUsuario({ request }: HttpContextContract) {
    const { usuarioNombre } = request.params();
    console.log(usuarioNombre);
    return Usuario.traerPerfilDeUsuario({ usuarioNombre });
    // return Usuario.query().where("usuario", usuarioNombre.toString());
  }

  public async mig_alta_usuarioWeb({ request, response }: HttpContextContract) {
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

  public async mig_alta_usuarioFarmacia({
    request,
    response,
  }: HttpContextContract) {
    const body = request.body();
    const nuevoUsuario = new Usuario();
    const nuevoPerfilUsuario = new UsuarioPerfil();

    nuevoUsuario.merge({
      usuario: body.username.toUpperCase(),
      password: body.password,
      nombre: body.first_name,
      apellido: body.last_name,
      email: body.email,
      id_wp: body.farmaciaid,
      esfarmacia: "s",
    });

    try {
      await nuevoUsuario.save();
    } catch (err) {
      console.log(err);
      return err;
    }

    nuevoPerfilUsuario.merge({
      id_perfil: body.perfil,
      id_usuario: nuevoUsuario.id,
    });

    try {
      await nuevoPerfilUsuario.save();
      response.status(201);
    } catch (err) {
      console.log(err);
      return err;
    }

    // const res = await Usuario.registrarUsuarioWeb(nuevoUsuario, response);
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
              texto: `Usted se ha registrado correctamente! <br/> Su usuario es: <strong>${nuevoUsuario.usuario}</strong><br/> Su contraseña es: <strong>${body.password}</strong>`,
              span: `Encontra tu Farmacia mas cercana`,
              linkspan: "https://app.farmageo.com.ar/#/",
            })
          );
      });
    }
    return nuevoUsuario;
  }

  public async mig_actualizar_usuarioWeb({
    request,
    response,
    bouncer,
  }: HttpContextContract) {
    const usuarioData = request.body().data;
    const token = request.header("authorization")?.split(" ")[1];

    bouncer
      .authorize("actualizarUsuarioWeb", usuarioData.id)
      .then(() => {
        Usuario.actualizarTelefonoUsuarioWeb({
          id: usuarioData.id,
          usuarioData: usuarioData,
          response,
          request,
        });
      })
      .catch((err) => {
        console.log(err);
        response.status(401);
      });
  }
}
