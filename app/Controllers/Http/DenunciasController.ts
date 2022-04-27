import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { Permiso } from "App/Helper/permisos";
import Denuncia from "App/Models/Denuncia";

export default class DenunciasController {
  public async index({ bouncer }) {
    await bouncer.authorize("AccesoRuta", Permiso.DENUNCIA_GET);
    return await Denuncia.query().preload("tipodenuncia");
  }
}
