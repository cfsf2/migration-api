/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from "@ioc:Adonis/Core/Logger";
import HttpExceptionHandler from "@ioc:Adonis/Core/HttpExceptionHandler";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import SErrorMysql from "App/Models/SErrorMysql";

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    "404": "errors/not-found",
    "500..599": "errors/server-error",
  };
  constructor() {
    super(Logger);
  }
  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    let errorKey = {};
    let errorMensajeTraducido: SErrorMysql | null = new SErrorMysql();

    if (error.sqlMessage) {
      errorKey = error.sqlMessage
        ?.split("key")
        .pop()
        .replaceAll("'", "")
        .trim();
      errorMensajeTraducido = await SErrorMysql.findBy("error_mysql", errorKey);
    }

    if (error.code === "E_VALIDATION_FAILURE") {
      const message = "La Validacion ha fallado";
      return ctx.response.status(409).send({
        error: { message },
        sql: ctx.$_sql,
      });
    }
    if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
      const message = "El tipo de valor no corresponde al dato solicitado";
      return ctx.response.status(409).send({
        error: { message },
        sql: ctx.$_sql,
      });
    }
    if (error.code === "ER_BAD_FIELD_ERROR") {
      return ctx.response
        .status(422)
        .send({ error: { message: error.code }, sql: ctx.$_sql });
    }
    if (error.code === "ER_DUP_ENTRY") {
      const message = errorMensajeTraducido
        ? errorMensajeTraducido.detalle
        : `${error.code}: Ya existe un registro con ese valor. No puede haber duplicados`;

      return ctx.response.status(409).send({
        error: { message },
        sql: ctx.$_sql,
      });
    }
    if (error.code === "extname") {
      const message = error.message;

      return ctx.response.status(409).send({
        error: { message },
        sql: ctx.$_sql,
      });
    }
    if (error.code === "E_REQUEST_ENTITY_TOO_LARGE") {
      const message = "El archivo es demasiado grande";

      return ctx.response.status(409).send({
        error: { message },
        sql: ctx.$_sql,
      });
    }

    // return ctx.response
    //   .status(411)
    //   .send({ error: { message: error.code, sql: error.sql }, sql: ctx.$_sql });

    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx);
  }
}
