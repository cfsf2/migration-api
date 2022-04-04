import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";
import { enumaBool } from "App/Helper/funciones";

export default class PedidoController {
  public async mig_usuario({ request }: HttpContextContract) {
    const { usuarioNombre } = request.params();

    return await Pedido.traerPedidos({ usuarioNombre });
  }

  public async mig_confirmarPedido({ request }: HttpContextContract) {
    return await Pedido.guardarPedido({ pedidoWeb: request.body() });
  }

  public async mig_admin_pedidos({ request }: HttpContextContract) {
    return await Pedido.traerPedidos({});
  }
}
