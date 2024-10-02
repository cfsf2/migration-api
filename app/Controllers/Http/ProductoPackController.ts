import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import {
  AccionCRUD,
  eliminarKeysVacios,
  guardarDatosAuditoria,
} from "App/Helper/funciones";
import { Permiso } from "App/Helper/permisos";
import ProductoCustom from "App/Models/ProductoCustom";
import ProductoPack from "App/Models/ProductoPack";

export default class ProductoPackController {
  public async mig_index() {
    try {
      return await ProductoPack.traerProductosPacks({
        en_papelera: "n",
        habilitado: "s",
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_entidad({ request }: HttpContextContract) {
    try {
      let entidadMutual = request.params().entidad;
      if (request.params().entidad === "5f4ad6ef84729400013dbecd") {
        entidadMutual = 3;
      }

      return await ProductoPack.traerProductosPacks({
        entidad: entidadMutual,
        habilitado: "s",
        en_papelera: "n",
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_producto({ request }: HttpContextContract) {
    try {
      const { idProducto } = request.params();
      const prods = await ProductoPack.traerProductosPacks({
        producto: idProducto,
        en_papelera: "n",
      });

      return prods ?? [];
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async producto({ request }: HttpContextContract) {
    // console.log("Holanda", request.params());
    try {
      const { idProducto } = request.params();
      const prods = await ProductoPack.query()
        .preload("categoria")
        .preload("entidad")
        .where("id", idProducto)
        .andWhere("en_papelera", "n")
        .andWhere("habilitado", "s");

      if (prods.length === 0) {
        const prodC = await ProductoCustom.query()
          .where("id", idProducto)
          .andWhere("en_papelera", "n")
          .andWhere("habilitado", "s");

        return prodC ?? [];
      }

      return prods ?? [];
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async mig_agregar_producto(ctx: HttpContextContract) {
    const { request, bouncer, auth } = ctx;
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_CREATE);
      const usuario = await auth.authenticate();

      const nuevoProducto = new ProductoPack();

      nuevoProducto.merge({
        descripcion: request.body().descripcion,
        imagen: request.body().imagen,
        nombre: request.body().nombre,
        precio: request.body().precio,
        precio_con_iva: request.body().precio_con_IVA,
        //precio_sin_IVA lo genera el front
        rentabilidad: request.body().rentabilidad,
        sku: request.body().sku,
        id_categoria: request.body().categoria_id,
        id_entidad: request.body().entidad_id,
        en_papelera: "n",
      });

      guardarDatosAuditoria({
        objeto: nuevoProducto,
        usuario: usuario,
        accion: AccionCRUD.crear,
      });
      nuevoProducto.save();
      return nuevoProducto;
    } catch (error) {
      return await new ExceptionHandler().handle(error, ctx);
    }
  }

  public async mig_update_producto({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_UPDATE);
      const usuario = await auth.authenticate();
      const { id } = request.qs();

      let producto = await ProductoPack.findOrFail(id);

      let mergeObject: any = {
        descripcion: request.body().descripcion,
        imagen: request.body().imagen,
        nombre: request.body().nombre,
        precio: request.body().precio,
        precio_con_iva: request.body().precio_con_IVA,
        rentabilidad: request.body().rentabilidad,
        sku: request.body().sku,
        id_categoria: request.body().categoria_id,
        id_entidad: request.body().entidad_id,
        en_papelera: "n",
      };

      mergeObject = eliminarKeysVacios(mergeObject);

      producto.merge(mergeObject);

      guardarDatosAuditoria({
        objeto: producto,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      producto.save();
      return producto;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }

  public async mig_delete_producto({
    request,
    bouncer,
    auth,
  }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.PDP_DELETE);
      const usuario = await auth.authenticate();
      const { id } = request.params();

      let producto = await ProductoPack.findOrFail(id);

      producto.merge({
        en_papelera: "s",
      });
      // console.log("directo a papelera...");

      guardarDatosAuditoria({
        objeto: producto,
        usuario: usuario,
        accion: AccionCRUD.editar,
      });
      producto.save();
      return producto;
    } catch (error) {
      throw new ExceptionHandler();
    }
  }

  public async mig_papelera({}: HttpContextContract) {
    try {
      return await ProductoPack.traerProductosPacks({
        en_papelera: "s",
      });
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
