import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Pedido from "App/Models/Pedido";
import { Permiso } from "App/Helper/permisos";
import ExceptionHandler from "App/Exceptions/Handler";

export default class PedidoController {
  public async mig_usuario(ctx: HttpContextContract) {
    const { request } = ctx;
    try {
      const { usuarioNombre } = request.params();
      return await Pedido.traerPedidos({ usuarioNombre });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_confirmarPedido(ctx: HttpContextContract) {
    const { request } = ctx;
    try {
      const pedido = await Pedido.guardarPedido({ pedidoWeb: request.body() });
      return pedido;
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_admin_pedidos(ctx: HttpContextContract) {
    const { bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET);
      return await Pedido.traerPedidos({});
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_farmacia_pedidos(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET_FARMACIA);
      const { idFarmacia } = request.params();
      return await Pedido.traerPedidos({ idFarmacia: idFarmacia });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_update_pedido(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
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
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_pedido(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PEDIDOS_GET);
      const { idPedido } = request.params();

      return Pedido.traerPedidos({ idPedido: idPedido });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }
}
