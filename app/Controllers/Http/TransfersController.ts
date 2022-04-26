import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Transfer from "App/Models/Transfer";

export default class TransfersController {
  public async mig_index({ request }: HttpContextContract) {
    return await Transfer.traerTransfers({});
  }

  public async mig_byFarmacia({ request }: HttpContextContract) {
    return await Transfer.traerTransfers({ id_farmacia: request.params().id });
  }

  public async mig_add({ request, auth }: HttpContextContract) {
    const usuario = auth.user;

    Transfer.guardar({ data: request.body(), usuario: usuario });
  }
}
