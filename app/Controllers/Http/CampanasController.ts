import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Campana from "App/Models/Campana";
import CampanaRequerimiento from "App/Models/CampanaRequerimiento";
import { guardarDatosAuditoria, AccionCRUD } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";

export default class CampanasController {
  public async index() {
    try {
      return await Campana.query();
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async activas(ctx: HttpContextContract) {
    const { request } = ctx;
    try {
      const { idUsuario, habilitado } = request.qs();
      const campanas = await Campana.query()
        .select(Database.raw("tbl_campana.*, tbl_campana.id as _id"))
        .preload("orientados")
        .preload("atributos", (query) => query.preload("atributo"))
        .apply((scopes) => scopes.forUser({ idUsuario: idUsuario }))
        .apply((scopes) => scopes.habilitado(habilitado))
        .apply((scopes) => scopes.vigente());

      const campanaConValores = campanas.map((c) => {
        let d = c.toObject();
        d.atributos = d.atributos.map((at) => {
          at.codigo = at.atributo.codigo;
          at.nombre = at.atributo.nombre;
          at.descripcion = at.atributo.descripcion;
          delete at.atributo;
          delete at.$extras;
          return at;
        });
        return d;
      });

      return campanaConValores;
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler().handle(err, ctx);
    }
  }

  public async todas() {
    try {
      return await Campana.query()
        .select(Database.raw("tbl_campana.*, tbl_campana.id as _id"))
        .preload("orientados")
        .preload("atributos");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_nuevoReq(ctx: HttpContextContract) {
    const { request, response } = ctx;
    try {
   
      const requerimientoSchema = schema.create({
        id_campana: schema.number(),
        id_usuario: schema.number.nullableAndOptional(),
        id_farmacia: schema.number.nullableAndOptional(),
        nombre: schema.string.nullableAndOptional(),
        documento: schema.number.nullableAndOptional(),
        celular: schema.string({}, [rules.minLength(10)]),
      });

      let random = () => {
        //alfanúmerico
        //return Math.random().toString(36).slice(2, 10).toUpperCase();

        //númerico
        return Math.random().toString().slice(2, 10);
      };

      const requerimiento = new CampanaRequerimiento();

      await request.validate({ schema: requerimientoSchema });
      requerimiento.fill(request.body()); //fill toma los nombres de los campos directamente del request.body, Funciona porque los nombres son iguales en ambos lugares.
      requerimiento.codigo_promo = random();

      await requerimiento.save();

      return response.status(201).send({
        msg: "El Requerimiento se genero con exito",
        codigo: requerimiento.codigo_promo,
      });
    } catch (error) {
      console.log(error);
      console.log(error.messages.errors)
      throw new ExceptionHandler().handle(error, ctx);
    }
  }

  public async negarReq(ctx: HttpContextContract) {
    const { response, request } = ctx;
    try {
      const requerimiento = new CampanaRequerimiento();

      requerimiento.merge({
        finalizado: "s",
        id_usuario: request.body().id_usuario,
        id_campana: request.body().id_campana,
      });
      requerimiento.codigo_promo = "NO_PARTICIPA";

      await requerimiento.save();

      return response.status(201).send({
        msg: "El Requerimiento se genero con exito",
        codigo: requerimiento.codigo_promo,
      });
    } catch (error) {
      console.log(error);
      throw new ExceptionHandler().handle(error, ctx);
    }
  }

  public async requerimientos({
    request,

    bouncer,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.REQUERIMIENTOS_GET);
      const { id_campana, finalizado, id_usuario } = request.qs();
      const reqs = await CampanaRequerimiento.query()
        .if(id_campana && id_campana !== "todas", (query) => {
          query.where("id_campana", id_campana);
        })
        .if(finalizado && finalizado !== "todas", (query) => {
          query.where("finalizado", finalizado);
        })
        .if(id_usuario && id_usuario !== "todas", (query) => {
          query.where("id_usuario", id_usuario);
        })
        .preload("valor", (query) => query.preload("atributo"))
        .preload("farmacia")
        .preload("usuario");

      return reqs.map((r) =>
        r.serialize({
          relations: {
            valor: {
              fields: ["valor", "sql"],
            },
          },
        })
      );
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_requerimientos({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.REQUERIMIENTOS_GET);
      const { id_campana, finalizado, id_usuario } = request.qs();
      return CampanaRequerimiento.traerRequerimientos({
        id_campana,
        finalizado,
        id_usuario,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async update_requerimiento({
    request,
    response,
    auth,
    bouncer,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.REQUERIMIENTOS_FINALIZADO);
      const usuario = await auth.authenticate();
      const { id } = request.body();
      const req = await CampanaRequerimiento.find(id);

      guardarDatosAuditoria({
        objeto: req,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      req?.merge(request.body());
      req?.save();
      return response.status(201).send("Actualizado Correctamente");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
