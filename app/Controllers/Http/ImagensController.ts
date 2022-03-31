import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class ImagensController {
  public async upload({ request, response }: HttpContextContract) {
    const file = request.file("file");
    console.log(file?.size);
    return response.send("aloja iamgen");
  }
}
