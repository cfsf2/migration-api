import { Request } from "@adonisjs/core/build/standalone";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
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
    let productoSelect = request.params().idProducto;

    if (productoSelect === "all") {
      return await ProductoPack.traerProductosPacks({ en_papelera: "n" });
    }
    return await ProductoPack.traerProductosPacks({
      producto: productoSelect,
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
      en_papelera: request.body().en_papelera
    });
    console.log(nuevoProducto);
    try {
      nuevoProducto.save();
      return nuevoProducto;
    } catch (error) {
      return error;
    }
  }
}
