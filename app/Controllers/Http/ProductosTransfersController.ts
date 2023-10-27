import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
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

      // const tp = await TransferProducto.query()
      //   .preload("instituciones")
      //   .select("tbl_transfer_producto.*")
      //   .where("en_papelera", "n")
      //   .andWhere("habilitado", "s")
      //   .andWhere("id_laboratorio", labid)
      //   .leftJoin(
      //     "tbl_transfer_producto_institucion",
      //     "tbl_transfer_producto.id",
      //     "tbl_transfer_producto_institucion.id_transfer_producto"
      //   )
      //   .preload("producto")
      //   .whereIn(
      //     "tbl_transfer_producto_institucion.id_institucion",
      //     instituciones
      //   )
      //   .groupBy("tbl_transfer_producto.id");

      const tpqd = Database.rawQuery(
        `select tbl_transfer_producto.*, IF(tbl_laboratorio.calcular_precio = 's',ROUND( IFNULL(productos.precio, p.precio)/100,2), tbl_transfer_producto.precio) as precio from tbl_transfer_producto 
        left join tbl_laboratorio on tbl_laboratorio.id = tbl_transfer_producto.id_laboratorio
        left join tbl_transfer_producto_institucion on tbl_transfer_producto.id = tbl_transfer_producto_institucion.id_transfer_producto 
        left join productos on productos.cod_barras = tbl_transfer_producto.codigo 
        left join barextra on barextra.cod_barras = tbl_transfer_producto.codigo left join productos as p on barextra.nro_registro_prod = p.nro_registro 
        where en_papelera = "n" and tbl_transfer_producto.habilitado = "s" 
        and tbl_transfer_producto.id_laboratorio = "${labid}" 
        and tbl_transfer_producto_institucion.id_institucion in (${instituciones.toString()}) group by tbl_transfer_producto.id`
      );
      console.log(tpqd.toQuery());
      const tpd = await tpqd;

      return tpd[0];
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

      const pf = await TransferProducto.agregar(request.body(), usuario);
      return ctx.response.status(209).send(pf);
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

  public async delete_by_lab(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
    const { id } = request.params();

    try {
      await bouncer.authorize("AccesoRuta", Permiso.TRANSFER_DELETE_PROD);
      const usuario = await auth.authenticate();

      const prods = await TransferProducto.query()
        .if(id !== "undefined", (query) => query.where("id_laboratorio", id))
        .andWhere("en_papelera", "n");

      await Promise.all(
        prods.map(async (prod) => {
          prod.merge({ en_papelera: "s" });

          guardarDatosAuditoria({
            objeto: prod,
            usuario: usuario,
            accion: AccionCRUD.crear,
          });
          await prod.save();
        })
      );

      return ctx.response
        .status(209)
        .send(`Se han enviado a papelera ${prods.length} productos.`);
    } catch (err) {
      return new ExceptionHandler().handle(err, ctx);
    }
  }
}
