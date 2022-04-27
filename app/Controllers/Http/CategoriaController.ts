import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import { eliminarKeysVacios } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Categoria from "App/Models/Categoria";

export default class CategoriaController {
  public async index({}: HttpContextContract) {
    return await Categoria.traerCategorias({ habilitado: "s" });
  }
  public async mig_admin({}: HttpContextContract) {
    return await Categoria.traerCategorias({});
  }

  public async mig_agregar_categoria({
    request,
    bouncer,
  }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PDP_CREATE_CATEGORIA);
    const nuevaCategoria = new Categoria();

    nuevaCategoria.merge({
      habilitado: request.body().habilitado === "true" ? "s" : "n",
      destacada: request.body().destacada === "true" ? "s" : "n",
      nombre: request.body().nombre,
    });

    try {
      nuevaCategoria.save();
      return nuevaCategoria;
    } catch (error) {
      return error;
    }
  }

  public async mig_update_categoria({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PDP_UPDATE_CATEGORIA);
    const { id } = request.qs();

    let categoria = await Categoria.findOrFail(id);

    let mergeObject: any = {
      habilitado: request.body().habilitado === "true" ? "s" : "n",
      destacada: request.body().destacada === "true" ? "s" : "n",
      nombre: request.body().nombre,
    };

    mergeObject = eliminarKeysVacios(mergeObject);

    categoria.merge(mergeObject);

    try {
      categoria.save();
      return categoria;
    } catch (error) {
      return error;
    }
  }
}
