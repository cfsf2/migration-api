import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { guardarDatosAuditoria, AccionCRUD } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Institucion from "App/Models/Institucion";

export default class InstitucionesController {
  public async mig_instituciones(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", [
        Permiso.INSTITUCIONES_GET,
        Permiso.INSTITUCIONES_GET_PARA_FARMACIA,
        Permiso.INSTITUCIONES_SEARCH,
      ]);

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
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler().handle(err, ctx);
    }
  }

  public async crear({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.INSTITUCIONES_CREATE);

      const usuario = await auth.authenticate();
      const institucion = new Institucion();

      institucion.merge(request.body());

      guardarDatosAuditoria({
        objeto: institucion,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      await institucion.save();
      return response.created();
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async actualizar({ request, bouncer, auth }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.INSTITUCIONES_UPDATE);
      const usuario = await auth.authenticate();

      const institucion = await Institucion.findOrFail(request.body().id);
      institucion.merge(request.body().data);

      guardarDatosAuditoria({
        objeto: institucion,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      return await institucion.save();
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
