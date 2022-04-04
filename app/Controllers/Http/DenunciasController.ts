import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Denuncia from "App/Models/Denuncia";

export default class DenunciasController {
  public async index({ request }: HttpContextContract){
      return await Denuncia.query().
      preload('tipodenuncia');
  };
}
