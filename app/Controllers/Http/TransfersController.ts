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

  public async verificartodos(ctx: HttpContextContract) {
    const data = ctx.request.body().data;

    await Promise.all(
      data.map(async (t) => {
        const transfer = await Transfer.findOrFail(t[0]);
        transfer.merge({ envio_email_verificado: "s" });
        await transfer.save();
      })
    );
    return data;
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

  //*** CONTROLLERS ESTABLES */

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
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_ADMIN);

      //  console.log(request.body().id);
      const transfer = await Transfer.findOrFail(request.body().id);

      return transfer.enviarMail(ctx);
    } catch (err) {
      console.log("CONTROLLER", err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async sendTransfer_a_este_email(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;

    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_ADMIN);

      const transfer = await Transfer.findOrFail(request.body().id);

      const emails = Object.values(request.body()).find((r) =>
        r.toString().includes("@")
      );
      if (!emails) {
        return await new ExceptionHandler().handle(
          { code: "SIN_EMAIL_VALIDO" },
          ctx
        );
      }

      return transfer.generarColaEmailUnico(ctx, emails);
    } catch (err) {
      console.log("CONTROLLER", err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }
}
