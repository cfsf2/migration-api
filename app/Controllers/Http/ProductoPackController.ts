import { Request } from "@adonisjs/core/build/standalone";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { eliminarKeysVacios } from "App/Helper/funciones";
import ProductoPack from "App/Models/ProductoPack";

export default class ProductoPackController {
  public async mig_index() {
    return await ProductoPack.traerProductosPacks({});
  }

  public async mig_entidad({ request }: HttpContextContract) {
    let entidadMutual = request.params().entidad;
    if (request.params().entidad === "5f4ad6ef84729400013dbecd") {
      entidadMutual = 3;
    }

    return await ProductoPack.traerProductosPacks({
      entidad: entidadMutual,
      habilitado: "s",
      en_papelera: "n",
    });
  }

  public async mig_producto({ request }: HttpContextContract) {
    return await ProductoPack.traerProductosPacks({
      habilitado: "s",
      en_papelera: "n",
    });
  }

  public async mig_agregar_producto({ request }: HttpContextContract) {
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
    console.log(nuevoProducto);
    try {
      nuevoProducto.save();
      return nuevoProducto;
    } catch (error) {
      return error;
    }
  }

  public async mig_update_producto({ request }: HttpContextContract) {
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

    try {
      producto.save();
      return producto;
    } catch (error) {
      return error;
    }
  }

  public async mig_delete_producto({ request }: HttpContextContract) {
    const { id } = request.params();

    let producto = await ProductoPack.findOrFail(id);

    producto.merge({
      en_papelera: "s",
    });
    console.log("directo a papelera...");

    try {
      producto.save();
      return producto;
    } catch (error) {
      return error;
    }
  }

  public async mig_papelera({ request }: HttpContextContract) {
    return await ProductoPack.traerProductosPacks({
      en_papelera: "s",
    });
  }
}
