import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { AccionCRUD, guardarDatosAuditoria } from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import TransferProducto from "App/Models/TransferProducto";
import TransferProductoInstitucion from "App/Models/TransferProductoInstitucion";

export default class ProductosTransfersController {
  public async mig_index(ctx: HttpContextContract) {
    const { bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PRODS);

      return await TransferProducto.traerTrasferProducto({
        en_papelera: "n",
        habilitado: "s",
      });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_bylab(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABID);

      const { instituciones } = request.qs();
      const labid = request.params().id;

      return await TransferProducto.traerTrasferProducto({
        en_papelera: "n",
        habilitado: "s",
        labid: labid,
        instituciones: instituciones,
      });
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  //*****  CONTROLLERS ESTABLES */

  public async bylab(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_LABID);

      const { instituciones } = request.qs();
      const labid = request.params().id;

      return await TransferProducto.query()
        .preload("instituciones")
        .select("tbl_transfer_producto.*")
        .where("en_papelera", "n")
        .andWhere("habilitado", "s")
        .andWhere("id_laboratorio", labid)
        .leftJoin(
          "tbl_transfer_producto_institucion",
          "tbl_transfer_producto.id",
          "tbl_transfer_producto_institucion.id_transfer_producto"
        )
        .whereIn(
          "tbl_transfer_producto_institucion.id_institucion",
          instituciones
        )
        .groupBy("tbl_transfer_producto.id");
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_instituciones(ctx: HttpContextContract) {
    const { request, bouncer } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_GET_PROD);
      const res = await TransferProductoInstitucion.query().where(
        "id_transfer_producto",
        request.params().id
      );

      const instituciones = res.map((r) => r.id_institucion.toString());
      return instituciones;
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_add(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_CREATE_PROD);
      const usuario = await auth.authenticate();

      return await TransferProducto.agregar(request.body(), usuario);
    } catch (err) {
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_actualizar(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_UPDATE_PROD);
      const usuario = await auth.authenticate();

      return await TransferProducto.actualizar(
        request.qs().id,
        request.body(),
        usuario
      );
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async mig_delete(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_DELETE_PROD);
      const usuario = await auth.authenticate();

      const prod = await TransferProducto.findOrFail(request.params().id);
      prod.merge({ en_papelera: "s" });

      guardarDatosAuditoria({
        objeto: prod,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      await prod.save();
      return prod;
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }
}
