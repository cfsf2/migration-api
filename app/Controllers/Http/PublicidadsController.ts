import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Publicidad from "../../Models/Publicidad";
import Database from "@ioc:Adonis/Lucid/Database";
import PublicidadTipo from "App/Models/PublicidadTipo";
import PublicidadColor from "App/Models/PublicidadColor";
import Institucion from "App/Models/Institucion";
import PublicidadInstitucion from "App/Models/PublicidadInstitucion";
import { eliminarKeysVacios } from "App/Helper/funciones";
import { DateTime } from "luxon";

export default class PublicidadsController {
  public async mig_publicidades({ request }: HttpContextContract) {
    return Publicidad.traerPublicidades({});

    // return await Publicidad.query()
    //   .preload("instituciones")
    //   .preload("juancito")
    //   .select("*")
    //   .where("id_publicidad_tipo", "=", "1");
  }
  public async mig_novedadesAdmin({ request }: HttpContextContract) {
    return Publicidad.traerPublicidades({ tipo: "novedadesadmin" });
  }
  public async mig_novedadesSearch({ request }: HttpContextContract) {
    const publicidades = await Publicidad.traerPublicidades({
      habilitado: request.qs().tipo,
      institucion: request.qs().instituciones,
      vigencia: request.qs().vigencia,
      titulo: request.qs().titulo,
    });
    return publicidades;
  }

  public async mig_novedadesFarmacia({ request }: HttpContextContract) {
    const novedades = await Publicidad.traerNovedadesFarmacias({
      id_farmacia: request.params().farmacia,
    });
    return novedades;
  }

  public async mig_agregar_novedad({ request }: HttpContextContract) {
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

    nuevaNovedad.save();

    request.body().instituciones.forEach((id_institucion) => {
      const publicidadInstitucion = new PublicidadInstitucion();
      publicidadInstitucion.merge({
        //el id no se guarda hasta que no se crea el registro
        id_publicidad: nuevaNovedad.id,
        id_institucion: Number(id_institucion),
      });
      publicidadInstitucion.save();
    });

    try {
      return;
    } catch (error) {
      return error;
    }
  }

  public async mig_update_novedad({ request }: HttpContextContract) {
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
      publicidad.save();
      return publicidad;
    } catch (error) {
      return error;
    }
  }
}
