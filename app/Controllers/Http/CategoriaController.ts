import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Categoria from "App/Models/Categoria";

export default class CategoriaController {
  public async index({ request }: HttpContextContract) {
    // return await Database.from("tbl_categoria as ca").select(
    //   "ca.habilitado",
    //   "ca.destacada",
    //   "ca.nombre",
    //   "ca.ts_creacion",
    //   "ca.id");
    return await Categoria.aBoleanos();
  }
}
