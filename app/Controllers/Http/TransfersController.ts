import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Transfer from "App/Models/Transfer";
import jwt from "jsonwebtoken";

export default class TransfersController {
  public async mig_index({ request }: HttpContextContract) {
    return await Transfer.traerTransfers();
  }

  public async mig_add({ request, session }: HttpContextContract) {
    const token = request.headers().authorization?.split("Bearer ")[1];
    console.log(token);
    const usuario = jwt.verify(token, process.env.JWTSECRET);
    console.log(usuario);
    Transfer.guardar(request.body());
  }
}
