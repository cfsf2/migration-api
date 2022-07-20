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
        const nombreArchivo = `A${timestamp}-${file.fileName}.${file.extname}`;
        const carpeta = "farmacias/";
        const res = await file.moveToDisk(
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
      return response.status(418).send("aloja MO niamgen NI NIGGA");
    } catch (err) {
      throw new ExceptionHandler();
    }
  }
}
