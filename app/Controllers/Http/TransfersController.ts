import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import Transfer from "App/Models/Transfer";

export default class TransfersController {
  public async mig_index(ctx: HttpContextContract) {
    const { bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET);

      return await Transfer.traerTransfers({});
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_byFarmacia(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_FARMACIA);
      return await Transfer.traerTransfers({
        id_farmacia: request.params().id,
      });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_add(ctx: HttpContextContract) {
    const { request, auth, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE);
      const usuario = await auth.authenticate();

      return await Transfer.guardar({
        data: request.body(),
        usuario: usuario,
        ctx,
      });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler();
    }
  }

  public async add(ctx: HttpContextContract) {
    const { request, auth, bouncer } = ctx;

    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE);
      const usuario = await auth.authenticate();

      return await Transfer.guardar_sql({
        data: request.body(),
        usuario: usuario,
        ctx,
      });
    } catch (err) {
      console.log("CONTROLLER", err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async sendTransfer(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;

    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE);

      console.log(request.body().id);
      const transfer = await Transfer.findOrFail(request.body().id);

      return transfer.enviarMail(ctx);
    } catch (err) {
      console.log("CONTROLLER", err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }
}
