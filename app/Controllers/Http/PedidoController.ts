import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";
import { Permiso } from "App/Helper/permisos";

export default class PedidoController {
  public async mig_usuario({ request }: HttpContextContract) {
    const { usuarioNombre } = request.params();

    return await Pedido.traerPedidos({ usuarioNombre });
  }

  public async mig_confirmarPedido({ request }: HttpContextContract) {
    return await Pedido.guardarPedido({ pedidoWeb: request.body() });
  }

  public async mig_admin_pedidos({ bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET);
    return await Pedido.traerPedidos({});
  }

  public async mig_farmacia_pedidos({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET_FARMACIA);
    const { idFarmacia } = request.params();
    return await Pedido.traerPedidos({ idFarmacia: idFarmacia });
  }

  public async mig_update_pedido({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PEDIDO_UPDATE);
    const usuario = await auth.authenticate();

    const { id } = request.qs();
    const pedidoCambios = request.body();

    return await Pedido.actualizarPedido({
      id: id,
      pedidoCambios: pedidoCambios,
      auth: usuario,
    });
  }

  public async mig_pedido({ request, bouncer }: HttpContextContract) {
    await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET);
    const { idPedido } = request.params();

    return Pedido.traerPedidos({ idPedido: idPedido });
  }
}
