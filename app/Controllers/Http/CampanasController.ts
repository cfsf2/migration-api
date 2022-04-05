import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
import Campana from "App/Models/Campana";
import CampanaRequerimiento from "App/Models/CampanaRequerimiento";

export default class CampanasController {
  public async index() {
    return await Campana.query();
  }

  public async activas({ request }: HttpContextContract) {
    const { idUsuario, habilitado } = request.qs();
    return await Campana.query()
      .select(Database.raw("tbl_campana.*, tbl_campana.id as _id"))
      .preload("orientados")
      .preload("atributos")
      .apply((scopes) => scopes.forUser({ idUsuario: idUsuario }))
      .apply((scopes) => scopes.habilitado(habilitado))
      .apply((scopes) => scopes.vigente());
  }

  public async mig_nuevoReq({ request, response }: HttpContextContract) {
    const requerimientoSchema = schema.create({
      id_campana: schema.number(),
      id_usuario: schema.number.nullable(),
      id_farmacia: schema.number.nullable(),
      celular: schema.string({}, [rules.mobile({ locales: ["es-AR"] })]),
    });

    let random = () => {
      return Math.random().toString(36).slice(2, 10).toUpperCase();
    };

    const requerimiento = new CampanaRequerimiento();

    try {
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
      return response.status(501).send(error);
    }
  }

  public async requerimientos({ request, response }: HttpContextContract) {
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
  }

  public async mig_requerimientos({ request }: HttpContextContract) {
    const { id_campana, finalizado, id_usuario } = request.qs();
    return CampanaRequerimiento.traerRequerimientos({
      id_campana,
      finalizado,
      id_usuario,
    });
  }

  public async update_requerimiento({
    request,
    response,
  }: HttpContextContract) {
    const { id, finalizado } = request.body();
    const req = await CampanaRequerimiento.find(id);
    req?.merge(request.body());
    req?.save();
    return response.status(201).send("Actualizado Correctamente");
  }
}
