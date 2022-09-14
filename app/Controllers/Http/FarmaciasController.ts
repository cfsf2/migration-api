import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml } from "../../Helper/email";

import Farmacia from "../../Models/Farmacia";
import { DateTime } from "luxon";
import Usuario from "App/Models/Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import { Permiso } from "App/Helper/permisos";

import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
import ExceptionHandler from "App/Exceptions/Handler";

export default class FarmaciasController {
  public async index() {
    try {
      return await Farmacia.query()
        .preload("servicios", (servicio) => {
          servicio.where("tbl_servicio.habilitado", "s");
        })
        .preload("localidad");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_index() {
    try {
      return await Farmacia.traerFarmacias({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_perfil({ request }: HttpContextContract) {
    try {
      const farmacia = await Farmacia.traerFarmacias({
        usuario: request.params().usuario,
      });

      if (request.url().includes("login") && farmacia.length !== 0) {
        console.log("actualizar ultimo acceso a ", farmacia.nombre);

        const farmaciaLogueada = await Farmacia.findOrFail(farmacia.id);

        farmaciaLogueada.f_ultimo_acceso = DateTime.now()
          .setLocale("es-Ar")
          .toFormat("yyyy-MM-dd hh:mm:ss");

        await farmaciaLogueada.save();
      }
      return farmacia;
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_matricula({ request }: HttpContextContract) {
    const { matricula } = request.params();
    return await Farmacia.traerFarmacias({ matricula });
  }

  public async mig_mail({ request }: HttpContextContract) {
    try {
      await validator.validate({
        schema: schema.create({
          destinatario: schema.string({ trim: true }, [rules.email()]),
        }),
        data: request.body(),
      });

      Mail.send((message) => {
        message
          .from("farmageoapp@gmail.com")
          .to(request.body().destinatario)
          .subject(request.body().asunto)
          .html(
            generarHtml({
              titulo: "Nueva solicitud de registro de farmacia",
              // imagen: '',
              texto: `${request.body().html}`,
            })
          );
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_updatePerfil({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      const usuario = await auth.authenticate();
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_UPDATE);

      const { username, id } = request.qs();
      return response.created(
        await Farmacia.actualizarFarmacia({
          usuario: username,
          d: request.body(),
          usuarioAuth: usuario,
        })
      );
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_admin_updatePerfil({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      const usuario = await auth.authenticate();
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_ADMIN_UPDATE);

      const data: {
        farmacia: any;
        usuario: any;
        instituciones: any;
        perfil: any;
      } = {
        farmacia: {},
        instituciones: {},
        usuario: {},
        perfil: null,
      };
      data.farmacia = request.body().farmacia;
      data.instituciones = request.body().instituciones;
      data.usuario = request.body().login;
      data.perfil = request.body().perfil;

      await Farmacia.actualizarFarmaciaAdmin({
        id: request.body().farmacia.id,
        data: data,
        usuarioAuth: usuario,
      });
      return response.created();
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler();
    }
  }

  public async mig_create({ request, bouncer, auth }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_CREATE);
    try {
      return Farmacia.crearFarmacia(request.body(), auth);
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_admin_passwords({ bouncer }) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIAS_ADMIN_GET);
      return await Database.from("tbl_farmacia")
        .leftJoin("tbl_usuario", "id_usuario", "tbl_usuario.id")
        .select("tbl_farmacia.password", "tbl_usuario.usuario");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async existeUsuario({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIAS_ADMIN_GET);
      const existe = await Usuario.findBy("usuario", request.params().usuario);

      if (existe) return true;
      return false;
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_admin_farmacia({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIAS_ADMIN_GET);
      const farmacia = await Farmacia.traerFarmacias({
        id: request.params().id,
        admin: request.url().includes("admin"),
      });
      delete farmacia.costoenvio;
      delete farmacia.imagen;
      delete farmacia.whatsapp;
      delete farmacia.instagram;
      delete farmacia.facebook;
      delete farmacia.telefonofijo;
      delete farmacia.web;
      delete farmacia.descubrir;
      delete farmacia.envios;
      delete farmacia.visita_comercial;
      delete farmacia.id_usuario_creacion;
      delete farmacia.id_usuario_modificacion;
      delete farmacia.ultimoacceso;
      delete farmacia.f_ultimo_acceso;

      return {
        farmacia: farmacia,
        instituciones: farmacia.instituciones,
        perfil: farmacia.id_perfil,
      };
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
