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
        const datos = await ConfBuilder.getDatos(
          ctx,
          conf,
          request.body().id,
          'tbl_qr_presentacion.anulado = "n"'
        );
        return await this.comisionistaPresentacionQrPdf(ctx, datos);
      }

      // const datos = await ConfBuilder.getDatos(ctx, conf, request.body().id);

      return "toma tu pdf";
    } catch (err) {
      console.log(err);
      return new ExceptionHandler().handle(err, ctx);
    }
  }

  public async comisionistaPresentacionQrPdf(ctx, datos) {
    const fechaEncabezado = DateTime.fromJSDate(
      datos[0].toJSON().TBL_QR_PRESENTACION_FILTRO_TS_CREACION
    ).toFormat("dd/MM/yyyy");
    const comisionista = datos[0].toJSON().COMISIONISTA_NOMBRE;

    const contenidoHTML = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { text-align: center; color: #333; }
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
            th { background-color: #f4f4f4; }
          </style>
        </head>
        <body>
          <h1>Detalle de Presentacion</h1>
          <p><strong>Comisionista:</strong> ${comisionista}</p>
          <p><strong>Fecha de creación:</strong> ${fechaEncabezado}</p>
          <table>
            <thead>
              <tr>
                <th>Farmacia</th>
                <th>Localidad</th>
                <th>QR</th>
                <th>Fecha de Ingreso</th>
                <th>Tipo de Ingreso</th>
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
                    <td>${DateTime.fromJSDate(item.fecha_ingreso).toFormat(
                      "dd/MM/yyyy"
                    )}</td>
                    <td>${item.tipo_ingreso}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(contenidoHTML);

    // Genera el PDF
    const pdfBuffer = await page.pdf({ format: "a4" });
    await browser.close();

    // Devuelve el PDF como respuesta
    ctx.response.header("Content-Type", "application/pdf");
    ctx.response.header(
      "Content-Disposition",
      `inline; filename=presentacion_qr_${comisionista}_${fechaEncabezado}.pdf`
    );
    return ctx.response.send(pdfBuffer);
  }
}
