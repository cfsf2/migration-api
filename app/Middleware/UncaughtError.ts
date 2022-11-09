import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";

export default class UncaughtError {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    process
      // .on("unhandledRejection", (reason, p) => {
      //   // console.error(reason, "Unhandled Rejection at Promise", p);
      // })
      .on("uncaughtException", async (err) => {
        console.log("Error no Capturado a tiempo");
        try {
          console.log(err);
        } catch (err) {
          console.log(Date.now(), ctx.auth.user?.id, ctx.$_errores, err);
          return await new ExceptionHandler().handle(err, ctx);
        }
        // process.exit(1);
        return await new ExceptionHandler().handle(err, ctx);
      });
    await next();
  }
}
