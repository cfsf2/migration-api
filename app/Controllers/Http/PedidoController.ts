import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";

export default class PedidoController {
  public async mig_usuario({ request }: HttpContextContract) {
    const { usuarioNombre } = request.params();

    return await Pedido.traerPedidos({ usuarioNombre });
  }

  public async mig_confirmarPedido({ request }: HttpContextContract) {
    return await Pedido.guardarPedido({ pedidoWeb: request.body() });
  }

  public async mig_admin_pedidos({ request }: HttpContextContract) {
    let pedidos = await Pedido.query()
      .select(
        "tbl_pedido.*",
        "tbl_pedido.ts_creacion as fechaalta",
        "tbl_pedido.id as _id"
      )
      .leftJoin("tbl_estado_pedido", "id_estado_pedido", "tbl_estado_pedido.id")
      .select("tbl_estado_pedido.nombre as estado");
    console.log(pedidos[0].toObject());
    const newPedido = pedidos.map((p) => {
      return p.gruposproductos; //.replace(/\s/g, "");
    });
    return newPedido;
  }
}
