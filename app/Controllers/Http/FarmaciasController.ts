import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import { generarHtml } from "../../Helper/email";

import Farmacia from "../../Models/Farmacia";
import { DateTime } from "luxon";
import Usuario from "App/Models/Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import { Permiso } from "App/Helper/permisos";

import { schema, validator } from "@ioc:Adonis/Core/Validator";
import ExceptionHandler from "App/Exceptions/Handler";
import {
  FarmaciaDrogueria,
  FarmaciaLaboratorio,
  Laboratorio,
} from "App/Helper/ModelIndex";
import Servicio from "App/Models/Servicio";
import QrPresentacion from "App/Models/QrPresentacion";

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

  public async mig_perfil(ctx: HttpContextContract) {
    const { request } = ctx;
    try {
      const usuario = await Usuario.findByOrFail(
        "usuario",
        request.params().usuario
      );

      if (usuario.esfarmacia === "s") {
        const farmacia = await Farmacia.traerFarmacias({
          usuario: request.params().usuario,
        });

        const farmaciaLogueada = await Farmacia.query()
          .where("id", farmacia.id)
          .preload("nro_cuenta_drogueria", (query) =>
            query.preload("drogueria")
          )
          .preload("nro_cuenta_laboratorio", (query) =>
            query.preload("laboratorio", (q) =>
              q.preload("modalidad_entrega").preload("tipo_comunicacion")
            )
          )
          .firstOrFail();

        if (request.url().includes("login") && farmacia.length !== 0) {
          farmaciaLogueada.f_ultimo_acceso = DateTime.now()
            .setLocale("es-Ar")
            .toFormat("yyyy-MM-dd hh:mm:ss");

          await farmaciaLogueada.save();
        }

        farmacia.nro_cuenta_drogueria =
          farmaciaLogueada.$preloaded.nro_cuenta_drogueria;
        farmacia.nro_cuenta_laboratorio =
          farmaciaLogueada.$preloaded.nro_cuenta_laboratorio;
        return farmacia;
      }
      return usuario;
    } catch (err) {
      console.log("MIG PERFIL ERROR: --------------- ", err);
      throw new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_matricula({ request }: HttpContextContract) {
    const { matricula } = request.params();
    return await Farmacia.traerFarmacias({ matricula });
  }

  public async mig_mail(ctx: HttpContextContract) {
    const { request } = ctx;
    try {
      await validator.validate({
        schema: schema.create({
          //  destinatario: schema.string({ trim: true }, [rules.email()]),
        }),
        data: request.body(),
      });

      const destinatarios = request.body().destinatario.split(";");

      const t = await Mail.send((message) => {
        message.from(Env.get("FARMAGEO_EMAIL"));

        for (const destinatario of destinatarios) {
          message.to(destinatario.trim());
        }

        message.subject(request.body().asunto).html(
          generarHtml({
            titulo: request.body().titulo,
            // imagen: '',
            texto: `${request.body().html}`,
          })
        );
      });
      return t;
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_updatePerfil({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      const usuario = await auth.authenticate();
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_UPDATE);

      const { username } = request.qs();
      return await Farmacia.actualizarFarmacia({
        usuario: username,
        d: request.body(),
        usuarioAuth: usuario,
      });
    } catch (err) {
      console.log("mig_updatePerfil", err);
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

  public async nro_cuenta(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    const { id_farmacia, id_laboratorio } = request.body();
    try {
      const farmacia = await Farmacia.query()
        .where("id", id_farmacia)
        .firstOrFail();

      await bouncer.authorize("adminOfarmacia", farmacia);

      const laboratorio = await Laboratorio.query()
        .where("id", id_laboratorio)
        .preload("apms")
        .preload("droguerias")
        .preload("modalidad_entrega")
        .preload("tipo_comunicacion")
        .firstOrFail();

      switch (laboratorio.modalidad_entrega.id_a) {
        case "DIRECTO":
          const cuenta = await FarmaciaLaboratorio.query()
            .where("id_farmacia", id_farmacia)
            .andWhere("id_laboratorio", id_laboratorio)
            .first();
          if (!cuenta) return {};
          return cuenta;
        case "ALGUNAS_DROGUERIAS":
          const droguerias_habilitadas = laboratorio.droguerias;

          const cuentas = await FarmaciaDrogueria.query()
            .where("id_farmacia", id_farmacia)
            .andWhereIn(
              "id_drogueria",
              droguerias_habilitadas.map((d) => d.id)
            )
            .preload("drogueria");

          return cuentas;

        case "TODAS_DROGUERIAS":
          return await FarmaciaDrogueria.query()
            .where("id_farmacia", id_farmacia)
            .preload("drogueria");
      }

      return [{}];
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler().handle(err, ctx);
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

  public async servicios() {
    const servicios = await Servicio.query().where("habilitado", "s");

    return servicios;
  }

  public async presentar(ctx: HttpContextContract) {
    const { data } = ctx.request.body();

    const res: any = [];
    await Promise.all(
      data.map(async (d) => {
        const [id_qr_farmacia, id_presentacion] = d;
        const nqrp = new QrPresentacion();
        await nqrp
          .merge({
            id_presentacion,
            id_qr_farmacia,
            observaciones: "",
            tipo_ingreso: "manual",
          })
          .save();
        res.push(nqrp);
      })
    );

    return res;
  }

  public async localidades(ctx: HttpContextContract) {
    const { id_provincia } = ctx.request.body();
    const localidades = await Farmacia.query()
      .select([
        "tbl_localidad.id",
        "tbl_localidad.nombre",
        "tbl_localidad.centroide_lon",
        "tbl_localidad.centroide_lat",
      ])
      .leftJoin(
        "tbl_localidad",
        "tbl_farmacia.id_localidad",
        "tbl_localidad.id"
      )
      .leftJoin(
        "tbl_departamento",
        "tbl_departamento.id",
        "tbl_localidad.id_departamento"
      )
      .leftJoin(
        "tbl_provincia",
        "tbl_provincia.id",
        "tbl_departamento.id_provincia"
      )
      .if(id_provincia, (q) => q.where("tbl_provincia.id", id_provincia))
      .groupBy("tbl_localidad.id")
      .orderBy("tbl_localidad.nombre", "asc");

    return localidades;
  }
}
