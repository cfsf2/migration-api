import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { Permiso } from "App/Helper/permisos";
import DebitoFarmacia from "App/Models/Debitofarmacia";

export default class DebitosController {
  public async debitos({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_DEBITOPAMI);

    const { cufe, periodo } = request.params();
    try {
      const debitos = await DebitoFarmacia.query()
        .where("usuario", cufe)
        .andWhere("periodo", periodo);
      return {
        statusCode: 200,
        body: debitos,
        message: debitos.length > 0 ? "Debitos" : "No se encontraron Debitos",
      };
    } catch (err) {
      return {
        statusCode: err.statusCode,
        message: err.message,
        error: err.error,
      };
    }
  }
}
