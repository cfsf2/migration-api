import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";

export default class PedidoController {
  public async mig_usuario({ request }: HttpContextContract) {
    const { usuarioNombre } = request.params();

    return await Pedido.traerPedidos({ usuarioNombre });
  }

  public async mig_confirmarPedido({ request }: HttpContextContract) {
    console.log(request.body());
    console.log(request.body().gruposproductos[0].productos);
    return request.body();
  }
}
