import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Publicidad from "../../Models/Publicidad";
import Database from "@ioc:Adonis/Lucid/Database";
import PublicidadTipo from "App/Models/PublicidadTipo";
import PublicidadColor from "App/Models/PublicidadColor";
import Institucion from "App/Models/Institucion";
import PublicidadInstitucion from "App/Models/PublicidadInstitucion";

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
      'nombre',
      request.body().color
    )

    nuevaNovedad.merge({
      fecha_inicio: request.body().fechainicio,
      fecha_fin: request.body().fechafin,
      titulo: request.body().titulo,
      descripcion: request.body().descripcion,
      habilitado: request.body().habilitado === true ? "s" : "n",
      id_publicidad_tipo: tipo.id,
      id_color: color.id,
    });

    nuevaNovedad.save()
    console.log('soy un string ', nuevaNovedad.habilitado)

    request.body().instituciones.forEach(id_institucion => {
      const publicidadInstitucion = new PublicidadInstitucion()
      publicidadInstitucion.merge({
        //el id no se guarda hasta que no se crea el registro
        id_publicidad: nuevaNovedad.id,
        id_institucion: Number(id_institucion)
      })
      publicidadInstitucion.save()
    });

    console.log(request.body())
    return;
  }
}
