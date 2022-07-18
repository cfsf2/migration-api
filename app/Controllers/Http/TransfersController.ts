import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import Transfer from "App/Models/Transfer";

export default class TransfersController {
  public async mig_index({ bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET);

      return await Transfer.traerTransfers({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_byFarmacia({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_FARMACIA);
      return await Transfer.traerTransfers({
        id_farmacia: request.params().id,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_add({ request, auth, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE);
      const usuario = await auth.authenticate();

      return await Transfer.guardar({ data: request.body(), usuario: usuario });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
