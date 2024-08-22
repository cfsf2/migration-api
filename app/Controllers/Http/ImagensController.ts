import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

import ExceptionHandler from "App/Exceptions/Handler";

export default class ImagensController {
  public async upload({ request, response }: HttpContextContract) {
    try {
      const file = request.file("file", {
        extnames: ["jpg", "png", "jpeg", "gif"],
      });
      if (file) {
        const timestamp = Date.now().toString();
        const fileClientName = file.clientName.split('.')[0]
        const nombreArchivo = `A${timestamp}-${fileClientName}.${file.extname}`;
        const carpeta = "farmacias/";
        await file.moveToDisk(
          carpeta,
          {
            contentType: file.type,
            cacheControl: "no-cache",
            visibility: "public",
            name: nombreArchivo,
          },
          "s3"
        );

        return response.send({
          Key: `${carpeta}${nombreArchivo}`,
        });
      }
      return response.status(418).send("Imagen subida");
    } catch (err) {
      console.log(err)
      throw new ExceptionHandler();
    }
  }
}
