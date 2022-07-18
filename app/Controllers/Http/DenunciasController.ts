import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import Denuncia from "App/Models/Denuncia";

export default class DenunciasController {
  public async index({ bouncer }) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.DENUNCIA_GET);
      return await Denuncia.query().preload("tipodenuncia");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
