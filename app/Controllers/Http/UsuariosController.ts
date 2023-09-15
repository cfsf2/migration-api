import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Usuario from "App/Models/Usuario";
import Mail from "@ioc:Adonis/Addons/Mail";

import { generarHtml } from "../../Helper/email";

import UsuarioPerfil from "App/Models/UsuarioPerfil";
import { AccionCRUD, guardarDatosAuditoria } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";
import Database from "@ioc:Adonis/Lucid/Database";
import Farmacia from "App/Models/Farmacia";
import EventoParticipante from "App/Models/EventoParticipante";

export default class UsuariosController {
  public async index({ bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.USER_GET_ALL);

      const usuarios = await Usuario.traerPerfilDeUsuario({
        usuarioNombre: "",
      });

      return usuarios;
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_perfilUsuario({ request }: HttpContextContract) {
    try {
      // await bouncer.authorize("AccesoRuta", Permiso.USER_GET);

      const { usuarioNombre } = request.params();
      //  console.log(usuarioNombre);

      return Usuario.traerPerfilDeUsuario({ usuarioNombre });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_alta_usuarioWeb({ request, response }: HttpContextContract) {
    try {
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
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_alta_usuarioFarmacia({
    request,
    response,
    auth,
    bouncer,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_CREATE);
      const usuario = await auth.authenticate();
      const body = request.body();
      const nuevoUsuario = new Usuario();
      const nuevoPerfilUsuario = new UsuarioPerfil();

      nuevoUsuario.merge({
        usuario: body.username.toUpperCase(),
        password: body.password,
        nombre: body.first_name,
        apellido: body.last_name,
        email: body.email,
        id_wp: body.farmaciaId,
        esfarmacia: "s",
      });

      try {
        guardarDatosAuditoria({
          objeto: nuevoUsuario,
          usuario: usuario,
          accion: AccionCRUD.crear,
        });
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
        guardarDatosAuditoria({
          objeto: nuevoPerfilUsuario,
          usuario: usuario,
          accion: AccionCRUD.crear,
        });
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
      return response.send(nuevoUsuario);
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_actualizar_usuarioWeb({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      const usuarioData = request.body().data;
      // const token = request.header("authorization")?.split(" ")[1];
      const usuarioAuth = await auth.authenticate();

      bouncer
        .authorize("actualizarUsuarioWeb", usuarioData.id)
        .then(() => {
          Usuario.actualizarTelefonoUsuarioWeb({
            id: usuarioData.id,
            usuarioData: usuarioData,
            response,
            request,
            usuarioAuth,
          });
        })
        .catch((err) => {
          console.log(err);
          response.status(401);
        });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_actualizar({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.USER_UPDATE);
      const usuarioAuth = await auth.authenticate();

      return await Usuario.actualizar({
        id_usuario: request.qs().id,
        data: request.body().data,
        usuarioAuth,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_alta_usuario({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.USER_CREATE);
      const usuarioAuth = await auth.authenticate();

      const data = request.body();
      return Usuario.registrarUsuarioAdmin(data, usuarioAuth);
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_newpassword({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.USER_NEWPASSWORD);
      const usuarioAuth = await auth.authenticate();

      return Usuario.cambiarPassword({
        id: request.qs().id,
        password: request.body().data,
        usuarioAuth,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async delete({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.USER_DELETE);
      const usuarioAuth = await auth.authenticate();

      return await Usuario.actualizar({
        username: request.qs().username,
        data: request.body(),
        usuarioAuth,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async usuario_invitado(ctx: HttpContextContract) {
    const { usuario } = ctx.request.body();
    if (usuario.matricula && usuario.cuit) {
      try {
        const usuario_invitado_query = Farmacia.query()
          .where("matricula", usuario.matricula)
          .andWhere("cuit", usuario.cuit)
          .preload("usuario")
          .preload("invitados")
          .first();

        const usuario_invitado = await usuario_invitado_query;
        if (!usuario_invitado) {
          throw { code: "Usuario no encontrado. Verifique sus datos." };
        }

        return usuario_invitado;
      } catch (err) {
        return ctx.response.status(440).send({ error: err, message: err.code });
      }
    }
    if (usuario.token) {
      const evento_participante = await EventoParticipante.query()
        .preload("evento")
        .where("token", usuario.token)
        .first();

      if (!evento_participante) return {};

      const usuario_invitado_query = Farmacia.query()
        .where("id", evento_participante.id_farmacia)
        .preload("usuario")
        .preload("invitados")
        .first();
      const usuario_invitado = await usuario_invitado_query;

      return usuario_invitado;
    }
    if (!!usuario.confirmo_asistencia && !!usuario.id) {
      try {
        const evento_participante = await EventoParticipante.query()
          .preload("evento")
          .where("id", usuario.id)
          .firstOrFail();

        const invitados = await EventoParticipante.query()
          .preload("evento")
          .where("id_farmacia", evento_participante.id_farmacia);

        await Promise.all(
          invitados.map(async (i) => {
            return await i
              .merge({ confirmo_asistencia: usuario.confirmo_asistencia })
              .save();
          })
        );

        return evento_participante;
      } catch (err) {
        console.log(err);
        return err;
      }
    }
    if (!!usuario.telefono && !!usuario.id) {
      try {
        const evento_participante = await EventoParticipante.query()
          .preload("evento")
          .where("id", usuario.id)
          .firstOrFail();

        const invitados = await EventoParticipante.query()
          .preload("evento")
          .where("id_farmacia", evento_participante.id_farmacia);

        const patron = /^\d{10}$/;
        const esCelular = patron.test(usuario.telefono);

        if (!esCelular) {
          throw { code: "No es un numero valido" };
        }

        await Promise.all(
          invitados.map(async (i) => {
            return await i.merge({ telefono: Number(usuario.telefono) }).save();
          })
        );

        return evento_participante;
      } catch (err) {
        console.log(err);
        return ctx.response
          .status(441)
          .send({ error: err, message: err.code ?? err.sqlMessage });
      }
    }
    if (!!usuario.id_evento_forma_pago && !!usuario.id) {
      try {
        const evento_participante = await EventoParticipante.query()
          .preload("evento")
          .where("id", usuario.id)
          .firstOrFail();

        await evento_participante
          .merge({ id_evento_forma_pago: usuario.id_evento_forma_pago })
          .save();

        return evento_participante;
      } catch (err) {
        console.log(err);
        return err;
      }
    }
  }

  public async usuario_invitado_add(ctx: HttpContextContract) {
    const { usuario, farmacia } = ctx.request.body();
    const farmacia_ = await Farmacia.query()
      .where("id", farmacia.id)
      .preload("invitados")
      .firstOrFail();
    const nuevoInvitado = new EventoParticipante();

    const titular = farmacia_.invitados.filter((i) => i.titular === "s").pop();

    if (!titular) return { error: "no hay titular" };

    nuevoInvitado.merge({
      nombre: usuario.nombre,
      documento: usuario.documento,
      token: usuario.token,
      id_farmacia: farmacia_.id,
      id_evento: titular.id_evento,
      id_evento_premio: titular.id_evento_premio,
      id_evento_forma_pago: titular.id_evento_forma_pago,
      confirmo_asistencia: titular.confirmo_asistencia,
      titular: "n",
      bonificada: "n",
      menor: usuario.menor,
      mesa: titular.mesa,
    });
    await nuevoInvitado.save();
    return nuevoInvitado;
  }

  public async usuario_invitado_delete(ctx: HttpContextContract) {
    const { usuario } = ctx.request.body();

    const ep = await EventoParticipante.findByOrFail("token", usuario.token);
    await ep.delete();

    return "eliminado";
  }

  public async evento(_ctx: HttpContextContract) {
    const evento = await Database.query()
      .from("tbl_evento")
      .where("id", 1)
      .firstOrFail();
    const formaPago = await Database.query().from("tbl_evento_forma_pago");

    return { evento, formaPago };
  }
}
