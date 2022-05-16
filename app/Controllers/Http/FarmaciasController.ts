import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml } from "../../Helper/email";

import Farmacia from "../../Models/Farmacia";
import { DateTime } from "luxon";
import Usuario from "App/Models/Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import { Permiso } from "App/Helper/permisos";
import ConfigsController from "../Interno/ConfigsController";

export default class FarmaciasController {
  public async index() {
    return await Farmacia.query()
      .preload("servicios", (servicio) => {
        servicio.where("tbl_servicio.habilitado", "s");
      })
      .preload("localidad");
  }

  public async mig_index() {
    return await Farmacia.traerFarmacias({});
  }

  public async mig_perfil({ request }: HttpContextContract) {
    const farmacia = await Farmacia.traerFarmacias({
      usuario: request.params().usuario,
    });

    if (request.url().includes("login") && farmacia.length !== 0) {
      console.log("actualizar ultimo acceso a ", farmacia.nombre);

      const farmaciaLogueada = await Farmacia.findOrFail(farmacia.id);

      farmaciaLogueada.f_ultimo_acceso = DateTime.now()
        .setLocale("es-Ar")
        .toFormat("yyyy-MM-dd hh:mm:ss");

      try {
        await farmaciaLogueada.save();
      } catch (err) {
        return console.log(err);
      }
    }
    return farmacia;
  }

  public async mig_matricula({ request }: HttpContextContract) {
    const { matricula } = request.params();
    return await Farmacia.traerFarmacias({ matricula });
  }

  public async mig_mail({ request }: HttpContextContract) {
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
  }

  public async mig_updatePerfil({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    const usuario = await auth.authenticate();
    //await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_UPDATE);

    const { username, id } = request.qs();
    try {
      return response.created(
        await Farmacia.actualizarFarmacia({
          usuario: username,
          d: request.body(),
          usuarioAuth: usuario,
        })
      );
    } catch (err) {
      return err;
    }
  }

  public async mig_admin_updatePerfil({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    const usuario = await auth.authenticate();
    //await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_ADMIN_UPDATE);

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

    try {
      await Farmacia.actualizarFarmaciaAdmin({
        id: request.body().farmacia.id,
        data: data,
        usuarioAuth: usuario,
      });
      return response.created();
    } catch (err) {
      return err;
    }
  }

  public async mig_create({ request, bouncer, auth }: HttpContextContract) {
    //await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_CREATE);
    return Farmacia.crearFarmacia(request.body(), auth);
  }

  public async mig_admin_passwords({ bouncer }) {
    //await bouncer.authorize("AccesoRuta", Permiso.FARMACIAS_ADMIN_GET);
    return await Database.from("tbl_farmacia")
      .leftJoin("tbl_usuario", "id_usuario", "tbl_usuario.id")
      .select("tbl_farmacia.password", "tbl_usuario.usuario");
  }

  public async existeUsuario({ request, bouncer }: HttpContextContract) {
    //await bouncer.authorize("AccesoRuta", Permiso.FARMACIAS_ADMIN_GET);
    const existe = await Usuario.findBy("usuario", request.params().usuario);

    if (existe) return true;
    return false;
  }

  public async mig_admin_farmacia({ request, bouncer }: HttpContextContract) {
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
  }

  public async servicios({ request, bouncer, response }: HttpContextContract) {
    console.log(request.qs());
    try {
      const confs = await ConfigsController.Config({
        config: request.qs().pantalla,
      });
      return confs;
    } catch (err) {
      console.log(err);
      return response.status(404);
    }
    // return await Servicio.find({});
  }
}
