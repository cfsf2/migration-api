import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";
import { boolaEnum, enumaBool } from "App/Helper/funciones";
import EstadoPedido from "App/Models/EstadoPedido";

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

  public async mig_farmacia_pedidos({ request }: HttpContextContract) {
    const { idFarmacia } = request.params();
    return await Pedido.traerPedidos({ idFarmacia: idFarmacia });
  }

  public async mig_update_pedido({ request }: HttpContextContract) {
    const { id } = request.qs();
    const pedidoCambios = request.body();

    return await Pedido.actualizarPedido({
      id: id,
      pedidoCambios: pedidoCambios,
    });
  }

  public async mig_pedido({ request }: HttpContextContract) {
    const { idPedido } = request.params();
    console.log(idPedido);

    return Pedido.traerPedidos({ idPedido: idPedido });
  }
}
