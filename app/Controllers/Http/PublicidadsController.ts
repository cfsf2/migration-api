import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Publicidad from "../../Models/Publicidad";

import PublicidadTipo from "App/Models/PublicidadTipo";
import PublicidadColor from "App/Models/PublicidadColor";

import PublicidadInstitucion from "App/Models/PublicidadInstitucion";
import {
  AccionCRUD,
  eliminarKeysVacios,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import { DateTime } from "luxon";
import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";

export default class PublicidadsController {
  public async mig_publicidades(ctx: HttpContextContract) {
    try {
      return Publicidad.traerPublicidades({});
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_novedadesAdmin(ctx: HttpContextContract) {
    const { bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.GET_NOVEDADES_ADMIN);
      return Publicidad.traerPublicidades({ tipo: "novedadesadmin" });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_novedadesSearch(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.GET_NOVEDADES_SEARCH);

      const publicidades = await Publicidad.traerPublicidades({
        habilitado: request.qs().habilitado,
        institucion: request.qs().instituciones,
        vigencia: request.qs().vigencia,
        titulo: request.qs().titulo,
      });
      return publicidades;
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_novedadesFarmacia(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.GET_NOVEDADES_FARMACIA);
      const novedades = await Publicidad.traerNovedadesFarmacias({
        id_farmacia: request.params().farmacia,
      });
      return novedades;
    } catch (error) {
      console.log(error);
      return new ExceptionHandler().handle(error, ctx);
    }
  }

  public async mig_agregar_novedad(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PUBLICIDADES_CREATE);

      const nuevaNovedad = new Publicidad();

      // const tipo =  await PublicidadTipo.query().where( 'nombre', request.body().tipo )
      //devuelve un array de objetos

      const tipo = await PublicidadTipo.findByOrFail(
        "nombre",
        request.body().tipo
      );
      //devuelve un objeto

      const color = await PublicidadColor.findByOrFail(
        "nombre",
        request.body().color
      );

      nuevaNovedad.merge({
        fecha_inicio: request.body().fechainicio,
        fecha_fin: request.body().fechafin,
        titulo: request.body().titulo,
        descripcion: request.body().descripcion,
        habilitado: request.body().habilitado === true ? "s" : "n",
        id_publicidad_tipo: tipo.id,
        id_color: color.id,
      });

      guardarDatosAuditoria({
        usuario: await ctx.auth.authenticate(),
        objeto: nuevaNovedad,
        accion: AccionCRUD.crear,
      });

      await nuevaNovedad.save();

      request.body().instituciones.forEach((id_institucion) => {
        const publicidadInstitucion = new PublicidadInstitucion();
        publicidadInstitucion.merge({
          id_publicidad: nuevaNovedad.id,
          id_institucion: Number(id_institucion),
        });
        publicidadInstitucion.save();
      });

      return;
    } catch (error) {
      console.log(error);
      return new ExceptionHandler().handle(error, ctx);
    }
  }

  public async mig_update_novedad(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PUBLICIDADES_UPDATE);
      const usuario = await auth.authenticate();

      const { id } = request.qs();

      let publicidad = await Publicidad.findOrFail(id);

      const tipo = request.body().tipo
        ? await PublicidadTipo.findBy("nombre", request.body().tipo)
        : null;
      //devuelve un objeto

      const color = request.body().color
        ? await PublicidadColor.findBy("nombre", request.body().color)
        : null;

      const fechainicioRaw = request.body().fechainicio;
      const fechafinRaw = request.body().fechafin;

      const fecha_inicio =
        !fechainicioRaw ||
        fechainicioRaw === "0000-00-00" ||
        !DateTime.fromISO(fechainicioRaw).isValid
          ? undefined
          : DateTime.fromISO(fechainicioRaw)
              .setLocale("es-Ar")
              .toFormat("yyyy-MM-dd hh:mm:ss");

      const fecha_fin =
        !fechafinRaw ||
        fechafinRaw === "0000-00-00" ||
        !DateTime.fromISO(fechafinRaw).isValid
          ? undefined
          : DateTime.fromISO(fechafinRaw)
              .setLocale("es-Ar")
              .toFormat("yyyy-MM-dd hh:mm:ss");

      let mergeObject: any = {
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        titulo: request.body().titulo,
        descripcion: request.body().descripcion,
        habilitado:
          request.body().habilitado === true ||
          request.body().habilitado === "true"
            ? "s"
            : "n",
        link: request.body().link,
        imagen: request.body().imagen,
        id_publicidad_tipo: tipo?.id,
        id_color: color?.id,
      };

      mergeObject = eliminarKeysVacios(mergeObject);

      publicidad.merge(mergeObject);

      guardarDatosAuditoria({
        objeto: publicidad,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      publicidad.save();
      return publicidad;
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }
}
