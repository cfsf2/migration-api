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
    });
  }
}
