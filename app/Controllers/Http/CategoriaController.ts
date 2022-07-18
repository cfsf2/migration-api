import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";

import {
  AccionCRUD,
  eliminarKeysVacios,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import Categoria from "App/Models/Categoria";

export default class CategoriaController {
  public async index({}: HttpContextContract) {
    try {
      return await Categoria.traerCategorias({ habilitado: "s" });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
  public async mig_admin({}: HttpContextContract) {
    try {
      return await Categoria.traerCategorias({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_agregar_categoria({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_CREATE_CATEGORIA);
      const usuario = await auth.authenticate();
      const nuevaCategoria = new Categoria();

      nuevaCategoria.merge({
        habilitado: request.body().habilitado === "true" ? "s" : "n",
        destacada: request.body().destacada === "true" ? "s" : "n",
        nombre: request.body().nombre,
      });

      guardarDatosAuditoria({
        objeto: nuevaCategoria,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevaCategoria.save();
      return nuevaCategoria;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }

  public async mig_update_categoria({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_UPDATE_CATEGORIA);
      const usuario = await auth.authenticate();
      const { id } = request.qs();

      let categoria = await Categoria.findOrFail(id);

      let mergeObject: any = {
        habilitado: request.body().habilitado === "true" ? "s" : "n",
        destacada: request.body().destacada === "true" ? "s" : "n",
        nombre: request.body().nombre,
      };

      mergeObject = eliminarKeysVacios(mergeObject);

      categoria.merge(mergeObject);

      guardarDatosAuditoria({
        objeto: categoria,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      categoria.save();
      return categoria;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }
}
