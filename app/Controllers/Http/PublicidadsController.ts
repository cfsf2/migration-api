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

export default class PublicidadsController {
  public async mig_publicidades({}: HttpContextContract) {
    return Publicidad.traerPublicidades({});
  }

  public async mig_novedadesAdmin({ bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.GET_NOVEDADES_ADMIN);
    return Publicidad.traerPublicidades({ tipo: "novedadesadmin" });
  }

  public async mig_novedadesSearch({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.GET_NOVEDADES_SEARCH);

    const publicidades = await Publicidad.traerPublicidades({
      habilitado: request.qs().habilitado,
      institucion: request.qs().instituciones,
      vigencia: request.qs().vigencia,
      titulo: request.qs().titulo,
    });
    return publicidades;
  }

  public async mig_novedadesFarmacia({
    request,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.GET_NOVEDADES_FARMACIA);
    const novedades = await Publicidad.traerNovedadesFarmacias({
      id_farmacia: request.params().farmacia,
    });
    try {
      return novedades;
    } catch (error) {
      return error;
    }
  }

  public async mig_agregar_novedad({
    request,
    bouncer,
  }: HttpContextContract) {
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

    try {
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
      return error;
    }
  }

  public async mig_update_novedad({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
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

    let mergeObject: any = {
      fecha_inicio: DateTime.fromISO(request.body().fechainicio)
        .setLocale("es-Ar")
        .toFormat("yyyy-MM-dd hh:mm:ss"),
      fecha_fin: DateTime.fromISO(request.body().fechafin)
        .setLocale("es-Ar")
        .toFormat("yyyy-MM-dd hh:mm:ss"),
      titulo: request.body().titulo,
      descripcion: request.body().descripcion,
      habilitado: request.body().habilitado === true ? "s" : "n",
      link: request.body().link,
      imagen: request.body().imagen,
      id_publicidad_tipo: tipo?.id,
      id_color: color?.id,
    };

    mergeObject = eliminarKeysVacios(mergeObject);

    publicidad.merge(mergeObject);

    try {
      guardarDatosAuditoria({
        objeto: publicidad,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      publicidad.save();
      return publicidad;
    } catch (error) {
      return error;
    }
  }
}
