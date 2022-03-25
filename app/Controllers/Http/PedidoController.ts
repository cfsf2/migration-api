import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";

export default class PedidoController {
  public async index({ request }: HttpContextContract) {
    return await Pedido.traerPedidos();
  }
}
