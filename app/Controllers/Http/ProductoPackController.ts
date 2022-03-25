import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ProductoPack from "App/Models/ProductoPack";

export default class ProductoPackController {
  public async index() {
    return await ProductoPack.traerProductosPacks();
  }
}
