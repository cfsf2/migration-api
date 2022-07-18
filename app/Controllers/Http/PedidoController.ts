import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";
import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";

export default class PedidoController {
  public async mig_usuario({ request }: HttpContextContract) {
    try {
      const { usuarioNombre } = request.params();
      return await Pedido.traerPedidos({ usuarioNombre });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_confirmarPedido({ request }: HttpContextContract) {
    try {
      return await Pedido.guardarPedido({ pedidoWeb: request.body() });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_admin_pedidos({ bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET);
      return await Pedido.traerPedidos({});
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_farmacia_pedidos({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET_FARMACIA);
      const { idFarmacia } = request.params();
      return await Pedido.traerPedidos({ idFarmacia: idFarmacia });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_update_pedido({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDO_UPDATE);
      const usuario = await auth.authenticate();

      const { id } = request.qs();
      const pedidoCambios = request.body();

      return await Pedido.actualizarPedido({
        id: id,
        pedidoCambios: pedidoCambios,
        auth: usuario,
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_pedido({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET);
      const { idPedido } = request.params();

      return Pedido.traerPedidos({ idPedido: idPedido });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
