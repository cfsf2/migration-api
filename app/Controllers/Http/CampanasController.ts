import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import { ResponseContract } from "@ioc:Adonis/Core/Response";
import { schema, rules, validator } from "@ioc:Adonis/Core/Validator";
import Campana from "App/Models/Campana";
import CampanaRequerimiento from "App/Models/CampanaRequerimiento";

export default class CampanasController {
  public async index() {
    return await Campana.query();
  }

  public async activas({ request }: HttpContextContract) {
    const { idUsuario, habilitado } = request.params();
    let campanas = await Campana.query()
      .select(Database.raw("tbl_campana.*, tbl_campana.id as _id"))
      .preload("orientados")
      .preload("atributos")
      .apply((scopes) => scopes.forUser({ idUsuario: idUsuario }))
      .apply((scopes) => scopes.habilitado(habilitado))
      .apply((scopes) => scopes.vigente());
    return campanas;
  }

  public async mig_nuevoReq({ request, response }: HttpContextContract) {
    const { id_campana, id_usuario, id_farmacia, celular } =
      request.body();

      const requerimientoSchema = schema.create({
        id_campana: schema.number(),
        id_usuario: schema.number.nullable(),
        id_farmacia: schema.number.nullable(),
        celular: schema.string({}, [rules.mobile({ locales: ["es-AR"] })]),
      });

   

    let random = () => {
      return Math.random().toString(36).slice(2,10)
    }

    const requerimiento = new CampanaRequerimiento();
    
    

    try {
      await request.validate({schema: requerimientoSchema})
      requerimiento.fill(request.body())
      requerimiento.codigo_promo = random();
    
      await requerimiento.save();
      console.log(request.body())
      return response.status(201).send(
        {
          msg: "El Requerimiento se genero con exito",
          codigo: requerimiento.codigo_promo
        }
      )
    } catch (error) {
      console.log(error)
      return response.status(501).send(error);
    }
  }

