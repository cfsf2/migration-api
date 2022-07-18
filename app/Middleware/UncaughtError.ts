import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";

export default class UncaughtError {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    process
      .on("unhandledRejection", (reason, p) => {
        // console.error(reason, "Unhandled Rejection at Promise", p);
      })
      .on("uncaughtException", (err) => {
        console.log("Error no Capturado a tiempo");
        try {
        } catch (err) {
          throw new ExceptionHandler().handle(err, ctx);
        }
        // process.exit(1);
      });
    await next();
  }
}
