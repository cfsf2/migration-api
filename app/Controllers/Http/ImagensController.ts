import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class ImagensController {
  public async upload({ request, response }: HttpContextContract) {
    return response.send("aloja iamgen");
  }
}
