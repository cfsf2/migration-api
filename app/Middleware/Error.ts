import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";

export default class Error {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL
    process.on("uncaughtException", async (error) => {
      try {
      } catch (err) {
        throw await new ExceptionHandler().handle(error, ctx);
      }
    });
    await next();
  }
}
