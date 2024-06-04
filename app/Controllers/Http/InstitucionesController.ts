import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { guardarDatosAuditoria, AccionCRUD } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Institucion from "App/Models/Institucion";
import Usuario from "App/Models/Usuario";

export default class InstitucionesController {
  public async mig_instituciones(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", [
        Permiso.INSTITUCIONES_GET,
        Permiso.INSTITUCIONES_GET_PARA_FARMACIA,
        Permiso.INSTITUCIONES_SEARCH,
      ]);

      // const instituciones = await Institucion.query()
      //   .select("tbl_institucion.id as _id", "tbl_institucion.*")
      //   .preload("institucion_madre");

      const {
        limit = 1000,
        search,
        habilitada: habilitado,
        id_institucion_madre,
      } = request.qs();
      const usuario =
        request.qs().usuario && ctx.usuario.Permisos.ADMINISTRADOR_INSTITUCION;

      if (usuario) {
        const _usuario = await Usuario.query()

          .where("tbl_usuario.id", ctx.usuario.id)
          .preload("instituciones", async (q) => {
            await q
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
          })
          .firstOrFail();

        return _usuario.instituciones;
      }
      const instituciones = await Institucion.query()
      .select(
        "tbl_institucion.id as _id", 
        "tbl_institucion.*",
        "institucionMadre.id as institucionMadre_id", 
        "institucionMadre.nombre as institucionMadreNombre"
      )
      .leftJoin("tbl_institucion as institucionMadre", "tbl_institucion.id_institucion_madre", "institucionMadre.id")
      .if(search, (query) => {
        query.where("tbl_institucion.nombre", "LIKE", `${search}%`);
      })
      .if(habilitado === "true" || habilitado === "false", (query) => {
        const condicional = habilitado === "true" ? "s" : "n";
        query.where("tbl_institucion.habilitado", condicional);
      })
      .if(id_institucion_madre, (query) => {
        query.where("tbl_institucion.id_institucion_madre", id_institucion_madre);
      })
      .if(limit, (query) => {
        query.limit(limit);
      });

    const institucionesFormatted = instituciones.map(inst => {
      return {
        id:inst._id,
        _id:inst._id,
        ...inst.$attributes, // Incluye todas las propiedades originales del objeto inst en $attributes
        ...inst.$extras, // Incluye todas las propiedades adicionales del objeto inst en $extras
        id_nombre_institucion: `${inst.$attributes._id} - ${inst.$attributes.nombre}`,
        id_nombre_institucion_madre: inst.$extras.institucionMadre_id && inst.$extras.institucionMadreNombre 
          ? `${inst.$extras.institucionMadre_id} - ${inst.$extras.institucionMadreNombre}` 
          : 'N/A',
        inst_habilitada: inst.$attributes.habilitado === 's' ? 'Si' : 'No',
      };
    });
    
    console.log('instituciones', institucionesFormatted);
    
    return institucionesFormatted;
    
        
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
