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
import { Permiso } from "App/Helper/permisos";

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

    if (error) {
      if (error.code) {
        errorMensajeTraducido = await SErrorMysql.findBy(
          "error_mysql",
          error?.code
        );
      }
      console.log(Date(), "Error Handler:", await error);

      if (error.sqlMessage) {
        errorKey = error.sqlMessage
          ?.split("key")
          .pop()
          .replaceAll("'", "")
          .trim();

        errorMensajeTraducido = await SErrorMysql.query()
          .where("error_mysql", errorKey as string)
          .first();
      }

      if (error.code === "E_INVALID_AUTH_PASSWORD") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El Password es incorrecto";
        return ctx.response.status(401).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "E_INVALID_AUTH_UID") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El Usuario no existe";
        return ctx.response.status(401).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "E_VALIDATION_FAILURE") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "La Validacion ha fallado";
        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El tipo de valor no corresponde al dato solicitado";
        return ctx.response.status(422).send({
          error: { message },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "WARN_DATA_TRUNCATED") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El tipo de valor no corresponde al dato solicitado";
        return ctx.response.status(422).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "ER_NO_DEFAULT_FOR_FIELD") {
        // console.log("Error de no default for field");
        const field = error.sqlMessage.split("'")[1];
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "Un valor debe ser provisto para " + field;
        return ctx.response.status(422).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "E_ROW_NOT_FOUND") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "Pagina no encontrada";
        console.log(error);
        return ctx.response.status(404).send({
          error: { message, e: error, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "ER_PARSE_ERROR") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : error.code + " : " + error.sql;

        return ctx.response.status(422).send({
          error: { message, e: error, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "ER_BAD_FIELD_ERROR") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : error.code + " " + error.sqlMessage;
        return ctx.response.status(422).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
          configuraciones: [],
          opciones: {},
        });
      }

      if (error.code === "ER_DUP_ENTRY") {
        const entry = error.sqlMessage.split("entry").pop().split("'")[1];
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle + " '" + entry + "' ."
          : `${error.code}: Ya existe un registro con el valor "${entry}". No puede haber duplicados`;

        return ctx.response.status(422).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "extname") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : error.message;

        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }
      if (error.code === "E_REQUEST_ENTITY_TOO_LARGE") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El archivo es demasiado grande";

        return ctx.response.status(422).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "recupero_sin_diagnostico") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El recupero debe tener al menos un diagnostico asociado para poder habilitar";

        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "recupero_sin_estadio") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El recupero debe tener al menos un estadio definido asociado para poder habilitar";

        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "recupero_sin_performance_status") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El recupero debe tener al menos un performance status definido asociado para poder habilitar";

        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "recupero_sin_linea_tratamiento") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El recupero debe tener al menos una linea de tratamiento definida asociada para poder habilitar";

        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "SCONF_NO_COMPONENT") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "Este tipo no lleva componente";

        return ctx.response.status(409).send({
          error: { message, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "TRANSFER_NO_SUPERA_MONTO_MINIMO") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : `El pedido no supera el monto minimo exigido por el laboratorio. Minimo: ${error.valor} `;

        return ctx.response.status(409).send({
          error: { message, code: error.code, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }
      if (error.code === "TRANSFER_NO_SUPERA_CANTIDAD_MINIMA") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : `El pedido no supera la cantidad minima de unidades exigido por el laboratorio. Minimo: ${error.valor}`;

        return ctx.response.status(409).send({
          error: { message, code: error.code, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "LAB_SIN_EMAIL") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "El Laboratorio no tiene un email asignado";

        return { error: { message }, errorSql: error.sql };
      }

      if (error.code === "SIN_EMAIL_VALIDO") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "Debe ingresar un email valido.";

        return ctx.response.status(409).send({
          error: { message, code: error.code, errorSql: error.sql },
          sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
            ? ctx.$_sql
            : undefined,
        });
      }

      if (error.code === "NO_HAY_OTRO_APM_ADMINISTRADOR") {
        const message = errorMensajeTraducido
          ? errorMensajeTraducido.detalle
          : "Debe haber al menos un APM administrador";

        return { error: { message } };
      }

      if (error.code === "E_CANNOT_WRITE_FILE") {
        const message =
          errorMensajeTraducido ??
          "Hubo un error al subir el archivo: " + error;

        return ctx.response.status(403).send({ error: { message } });
        // return { error: { message } };
      }
    }
    return ctx.response.badRequest({
      error: {
        message:
          errorMensajeTraducido?.detalle ?? error?.sqlMessage ?? error?.message,
        error: error,
        errorSql: error?.sql,
      },
      sql: (await ctx.bouncer.allows("AccesoRuta", Permiso.GET_SQL))
        ? ctx.$_sql
        : undefined,
    });
    //   .status(411)
    //   .send({ errorctx.: { message: error.code, sql: error.sql }, sql: (await bouncer.allows("AccesoRuta", Permiso.GET_SQL))
    //      ? ctx.$_sql
    //      : undefined });

    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx);
  }
}
