import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Institucion from "App/Models/Institucion";

export default class InstitucionesController {
  public async mig_instituciones({ request }: HttpContextContract) {
    const {
      limit = 1000,
      search,
      habilitada: habilitado,
      id_institucion_madre,
    } = request.qs();

    const instituciones = await Institucion.query()
      .select("tbl_institucion.id as _id", "tbl_institucion.*")
      .preload("institucion_madre")
      .if(search, (query) => {
        query.where("nombre", "LIKE", `${search}%`);
      })

      .if(habilitado === "true" || habilitado === "false", (query) => {
        const condicional = habilitado === "true" ? "s" : "n";
        query.where("habilitado", condicional);
      })

      .if(id_institucion_madre, (query) => {
        query.where("id_institucion_madre", id_institucion_madre);
      })

      .if(limit, (query) => {
        query.limit(limit);
      });
    return instituciones;
  }

  public async crear({ request, response }: HttpContextContract) {
    const institucion = new Institucion();
    try {
      await institucion.merge(request.body()).save();
      return response.created();
    } catch (err) {
      return err;
    }
  }

  public async actualizar({ request, response }: HttpContextContract) {
    const institucion = await Institucion.findOrFail(request.body().id);
    institucion.merge(request.body().data);
    try {
      return await institucion.save();
    } catch (err) {
      return response.status(406).send(err);
    }
  }
}
