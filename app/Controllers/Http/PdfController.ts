import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { getConf } from "./ConfigsController";
import { ConfBuilder } from "App/Helper/configuraciones";
import { _log } from "App/Helper/funciones";
import { DateTime } from "luxon";
import puppeteer from "puppeteer";

export default class PdfsController {
  public async makepdf(ctx: HttpContextContract) {
    const { request } = ctx;
    try {
      // console.log(request.params(), request.qs(), request.body());
      const conf = await getConf(request.params().configuracion);

      if (request.params().configuracion === "LISTADO_PRESENTACIONES_QR") {
        const datos = await ConfBuilder.getDatos(ctx, conf, request.body().id, {
          where: 'tbl_qr_presentacion.anulado = "n"',
          orderBy:
            "tbl_farmacia.nombre asc, tbl_qr_presentacion.ts_creacion asc",
        });
        return await this.comisionistaPresentacionQrPdf(ctx, datos);
      }

      // const datos = await ConfBuilder.getDatos(ctx, conf, request.body().id);

      return "pdf servido";
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async comisionistaPresentacionQrPdf(ctx:HttpContextContract, datos) {
    try {
      // Convertir la imagen JPEG a Base64 (asegúrate de cargar la imagen desde tu sistema o servidor)
      const fs = require("fs");
      const path = require("path");
      const membretePath = path.join(__dirname, "../../../public/DOS.jpeg"); // Ruta de la imagen
      const membreteBase64 = fs.readFileSync(membretePath, {
        encoding: "base64",
      });

      const fechaEncabezado = DateTime.fromJSDate(
        datos[0].toJSON().TBL_QR_PRESENTACION_FILTRO_TS_CREACION
      ).toFormat("dd/MM/yyyy");
      const comisionista = datos[0].toJSON().COMISIONISTA_NOMBRE;

      const contenidoHTML = `
                <html>
                  <head>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        margin:0 1rem;
                        padding: 0;
                      }
                      header {
                        text-align: center;
                        margin-bottom: 20px;
                        padding: 20px 0;
                        border-bottom: 2px solid #ddd;
                      }
                      header img {
                        max-width: 150px;
                        margin-bottom: 10px;
                      }
                      header h2 {
                        margin: 0;
                        font-size: 16px;
                        color: #555;
                      }
                      h1 {
                        text-align: center;
                        color: #333;
                        margin-top: 20px;
                      }
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                      }
                      th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                      }
                      th {
                        background-color: #f4f4f4;
                      }
                    </style>
                  </head>
                  <body>
                    <header>
                      <img src="data:image/jpeg;base64,${membreteBase64}" alt="Membrete">
                      <h2>DEPARTAMENTO DE OBRAS SOCIALES<br>
                      Colegio de Farmacéuticos de la Provincia de Santa Fe 2ª Circunscripción</h2>
                    </header>
                    <h1>Detalle de Presentacion</h1>
                    <p><strong>Comisionista:</strong> ${comisionista}</p>
                    <p><strong>Presentacion:</strong> ${fechaEncabezado}</p>
                    <p><strong>Fecha:</strong> ${DateTime.now().toFormat(
                      "dd/MM/yyyy HH:mm"
                    )}</p>
                    <table>
                      <thead>
                        <tr>
                          <th>Farmacia</th>
                          <th>Localidad</th>
                          <th>Grupo</th>
                          <th>Fecha de Ingreso</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${datos
                          .map((i) => {
                            const item = i.toJSON();
                            return `
                            <tr>
                              <td>${item.farmacia}</td>
                              <td>${item.localidad}</td>
                              <td>${item.qr}</td>
                              <td>${DateTime.fromJSDate(
                                item.fecha_ingreso
                              ).toFormat("dd/MM/yyyy HH:mm")} hs</td>
                            </tr>
                          `;
                          })
                          .join("")}
                      </tbody>
                    </table>
                    <p>El contenido de los paquetes recibidos se encuentra sujeto a revisión.</p>
                  </body>
                </html>`;

      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"], // Desactiva el sandbox
      });

      const page = await browser.newPage();
      await page.setContent(contenidoHTML);

      // Genera el PDF
      const pdfBuffer = await page.pdf({ format: "a4" });
      await browser.close();

      // Devuelve el PDF como respuesta

      ctx.response.header("Content-Type", "application/pdf");
      ctx.response.header(
        "Content-Disposition",
        `inline;filename=presentacion_qr_${comisionista?.trim()}_${fechaEncabezado}.pdf`
      );
      console.log(ctx.response.getHeaders())
      return ctx.response.send(pdfBuffer);
    } catch (err) {
      console.log("ERROR DE PDF",err);
      throw err
    }
  }
}
