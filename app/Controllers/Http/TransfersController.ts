import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Transfer from "App/Models/Transfer";

export default class TransfersController {
  public async mig_index({ request }: HttpContextContract) {
    return await Transfer.traerTransfers()
  }
}
