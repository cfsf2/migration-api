import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Categoria from "App/Models/Categoria";

export default class CategoriaController {
  public async index({ request }: HttpContextContract) {
    return await Categoria.traerCategorias({ habilitado: true });
  }
  public async mig_admin({ request }: HttpContextContract) {
    return await Categoria.traerCategorias({});
  }

  public async mig_agregar_categoria ({request}: HttpContextContract){
    const nuevaCategoria = new Categoria();

    nuevaCategoria.merge({
      habilitado: request.body().habilitado === 'true' ? 's' : 'n',
      destacada: request.body().destacada === 'true' ? 's' : 'n',
      nombre: request.body().nombre
    })
    console.log(nuevaCategoria)
    return nuevaCategoria.save()
  }
}
