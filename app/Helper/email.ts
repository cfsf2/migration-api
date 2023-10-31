import Laboratorio from "App/Models/Laboratorio";
import { DateTime } from "luxon";

const imagen_path = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/imagenes/`;

interface Email {
  titulo: string;
  texto: string;
  subtitulo?: string;
  imagen?: string;
  linkimagen?: string;
  span?: string;
  linkspan?: string;
}
export const generarHtml = ({
  titulo,
  texto,
  subtitulo,
  imagen,
  linkimagen,
  span,
  linkspan,
}: Email): string => {
  return `
  <!DOCTYPE html>

  <html lang="es">
  <style>
      * {
          box-sizing: border-box;
      }
  
      body {
          margin: 0;
          padding: 0;
      }
  
      a[x-apple-data-detectors] {
          color: inherit !important;
          text-decoration: inherit !important;
      }
  
      #MessageViewBody a {
          color: inherit;
          text-decoration: none;
      }
  
      p {
          line-height: inherit
      }
  
      @media (max-width:620px) {
          .icons-inner {
              text-align: center;
          }
  
          .icons-inner td {
              margin: 0 auto;
          }
  
          .fullMobileWidth,
          .row-content {
              width: 100% !important;
          }
  
          .image_block img.big {
              width: auto !important;
          }
  
          .column .border {
              display: none;
          }
  
          .stack .column {
              width: 100%;
              display: block;
          }
      }
  </style>
  
  <body style="background-color: #FFFFFF; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #FFFFFF;" width="100%" cellspacing="0" cellpadding="0" border="0" >
      <tbody>
        <tr>
          <td>
            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5;" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
              <tbody>
                <tr>
                  <td style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                    <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tbody>
                        <tr>
                          <td style="width:100%;padding-right:0px;padding-left:0px;padding-top:20px;padding-bottom:20px;">
                            <div style="line-height:10px" align="center">
                              <img alt="Farmageo-logo" src="${imagen_path}logo_farmageo.png" style="display: block; height: auto; border: 0; width: 250px; max-width: 100%;" title="farmageo-logo" width="150">
                              </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5;" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
              <tbody>
                <tr>
                  <td>
                    <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 600px;" width="600" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tbody>
                        <tr>
                          <td style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align:left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tbody>
                                <tr>
                                  <td style="width:100%;padding-right:0px;padding-left:0px;">
                                    <div style="line-height:10px" align="center">
                                        ${
                                          imagen
                                            ? `<a href="${
                                                linkimagen ? linkimagen : "#"
                                              }"><img alt="image-promo" src=${imagen} style="display: block; height: auto; border: 0; width: 600px; max-width: 100%;" title="imagen_prom" width="600"></a>`
                                            : ""
                                        }
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tbody>
                                <tr>
                                  <td style="text-align:center;width:100%;padding-top:35px;">
                                    <h1 style="margin: 0; color: #072b52; direction: ltr; font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 38px; font-weight: normal; letter-spacing: 1px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><strong>${titulo}</strong></h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5;" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
              <tbody>
                 <tr>
                  <td>
                    <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 600px;" width="600" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tbody>
                        <tr>
                          <td style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
                            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom:40px;padding-left:15px;padding-right:15px;padding-top:40px;">
                                    <div style="font-family: Tahoma, Verdana, sans-serif">
                                      <div style="font-size: 12px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 18px; color: #222222; line-height: 1.6;">
                                        <p style="margin: 0; font-size: 16px; text-align: center; mso-line-height-alt: 24px;">
                                          <span style="font-size:16px;">
                                           ${
                                             subtitulo
                                               ? `<strong>${subtitulo}</strong>`
                                               : ""
                                           }
                                           <span>
                                        </p>
                                        <p style="margin: 0; font-size: 16px; text-align: center; mso-line-height-alt: 24px;">
                                          <span style="font-size:16px;">
                                           ${texto}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>                             
                             </table>
                          <td>
                         <tr>
                       <tbody>   
                    </table>
                  <td>
                 <tr>
               <tbody>
            </table>
           <!--postBody-->
            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5;" width="100%" cellspacing="0" cellpadding="0" border="0" align="center">
              <tbody>
                <tr>
                  <td>
                    <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000000; width: 600px;" width="600" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tbody>
                        <tr>
                          <td style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 0px; padding-bottom: 0px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
                            <table style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tbody>
                                <tr>
                                  <td style="padding-bottom:35px;padding-left:5px;padding-right:5px;padding-top:30px;text-align:center;width:100%;">
                                   ${
                                     span
                                       ? `<h1 style="margin: 0; color: #072b52; direction: ltr; font-family: Tahoma, Verdana, Segoe, sans-serif; font-size: 19px; font-weight: normal; letter-spacing: 1px; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;"><a href="${
                                           linkspan ? linkspan : "#"
                                         }"><strong>${span}</strong></a></h1>`
                                       : ""
                                   }
                                  </td>
                                 </tr>
                               </tbody>
                            </table>
                            
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tbody>
            </table>
             <table align="center" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5;" width="100%">
  <tbody>
  <tr>
  <td>
  <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5; color: #000000; width: 600px;" width="600">
  <tbody>
  <tr>
  <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
  <table border="0" cellpadding="0" cellspacing="0" class="html_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
  <tr>
  <td>
  <div align="center" style="font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;"><div style="height:30px;"> </div></div>
  </td>
  </tr>
  </table>
  <table border="0" cellpadding="0" cellspacing="0" class="image_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
  <tr>
  <td style="width:100%;padding-right:0px;padding-left:0px;">
  <div align="center" style="line-height:10px"><img alt="your-logo" src="${imagen_path}logo_farmageo.png" style="display: block; height: auto; border: 0; width: 120px; max-width: 100%;" title="your-logo" width="120"/></div>
  </td>
  </tr>
  </table>
  <table border="0" cellpadding="0" cellspacing="0" class="html_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
  <tr>
  <td>
  <div align="center" style="font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;"><div style="height:30px;"> </div></div>
  </td>
  </tr>
  </table>
  <table border="0" cellpadding="0" cellspacing="0" class="social_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
  <tr>
  <td style="text-align:center;padding-right:0px;padding-left:0px;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" class="social-table" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="168px">
  <tr>
  <td style="padding:0 5px 0 5px;"><a href="#" target="_blank"><img alt="Facebook" height="32" src="${imagen_path}facebook.png" style="display: block; height: auto; border: 0;" title="Facebook" width="32"/></a></td>
  <td style="padding:0 5px 0 5px;"><a href="#" target="_blank"><img alt="Twitter" height="32" src="${imagen_path}twitter.png" style="display: block; height: auto; border: 0;" title="Twitter" width="32"/></a></td>
  <td style="padding:0 5px 0 5px;"><a href="#" target="_blank"><img alt="Instagram" height="32" src="${imagen_path}instagram.png" style="display: block; height: auto; border: 0;" title="Instagram" width="32"/></a></td>
  <td style="padding:0 5px 0 5px;"><a href="#" target="_blank"><img alt="YouTube" height="32" src="${imagen_path}youtube.png" style="display: block; height: auto; border: 0;" title="YouTube" width="32"/></a></td>
  </tr>
  </table>
  </td>
  </tr>
  </table>
  <table border="0" cellpadding="0" cellspacing="0" class="html_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;" width="100%">
  <tr>
  <td>
  <div align="center" style="font-family:Arial, Helvetica Neue, Helvetica, sans-serif;text-align:center;"><div style="height:30px;"> </div></div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
                  <table align="center" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f7f6f5;" width="100%">
  <tbody>
  <tr>
  <td>
  <table align="center" border="0" cellpadding="0" cellspacing="0" class="row-content stack" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #072b52; color: #000000; width: 600px;" width="600">
  <tbody>
  <tr>
  <td class="column column-1" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; vertical-align: top; padding-top: 5px; padding-bottom: 5px; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;" width="100%">
  <table border="0" cellpadding="10" cellspacing="0" class="text_block" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;" width="100%">
  <tr>
  <td>
  <div style="font-family: Tahoma, Verdana, sans-serif">
  <div style="font-size: 12px; font-family: 'Lato', Tahoma, Verdana, Segoe, sans-serif; mso-line-height-alt: 14.399999999999999px; color: #f7f6f5; line-height: 1.2;">
  <p style="margin: 0; mso-line-height-alt: 14.399999999999999px;"> </p>
  <p style="margin: 0; text-align: center;">
    <a href="https://www.farmageo.com.ar/novedades/terminos-y-condiciones/" rel="noopener" style="text-decoration: underline; color: #f7f6f5;" target="_blank" title="Términos y condiciones Farmageo">Términos y condiciones</a>
      
   </p>
    
  <p style="margin: 0; font-size: 12px; text-align: center;"><span style="color:#c0c0c0;"><br/><br/></span></p>
  <p style="margin: 0; text-align: center;">© Copyright 2022 - Desarrollo por Departamento de desarrollo y tecnología / CFSF2 </p>
    <!--Botón desuscribir ??  <p style="margin: 0; text-align: center;"><a href="http://www.example.com/" rel="noopener" style="color: #f7f6f5;" target="_blank" title="http://www.example.com">Unsubscribe</a></p> -->
  <p style="margin: 0; font-size: 12px; text-align: center;"><span style="color:#c0c0c0;"> </span></p>
  </div>
  </div>
  </td>
  </tr>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
  </td>
  </tr>
  </tbody>
  </table>
    
          </td>
        </tr>
      </tbody>
    </table>
      
     
  </body>
  </html>
        `;
};

function validarValor(valor) {
  if (
    valor === null ||
    valor === undefined ||
    (typeof valor === "string" && valor.trim() === "")
  ) {
    return null;
  } else {
    return valor;
  }
}

export const html_transfer = async (transfer) => {
  try {
    const laboratorio = await Laboratorio.findOrFail(transfer.id_laboratorio);
    const calcularPrecio = laboratorio.calcular_precio === "s";
    let total = 0;
    let ahorro = 0;
    if (calcularPrecio) {
      total = await transfer.getTotal();
      ahorro = await transfer.getAhorro();
    }

    let stringTable = await Promise.all(
      transfer.ttp.map(async (p) => {
        let presentacion = p.transfer_producto.presentacion;
        let codigo = p.transfer_producto.codigo;
        let nombre = p.transfer_producto.nombre;
        if (calcularPrecio) {
          await p.transfer_producto.load("producto");
          await p.transfer_producto.load("barextra_producto");

          codigo =
            validarValor(p.transfer_producto.producto?.cod_barras) ??
            validarValor(
              p.transfer_producto.barextra_producto[0]?.cod_barras
            ) ??
            codigo;
          presentacion =
            validarValor(p.transfer_producto.producto?.presentacion) ??
            validarValor(
              p.transfer_producto.barextra_producto[0]?.presentacion
            ) ??
            presentacion;
          nombre =
            validarValor(p.transfer_producto.producto?.nombre) ??
            validarValor(p.transfer_producto.barextra_producto[0]?.nombre) ??
            nombre;
        }

        const fila = `<tr>
                              <td>${codigo}</td>
                              <td>${nombre}</td>
                              <td>${presentacion}</td>
                              <td>${p.cantidad}</td>
                              <td>${p.observaciones ?? ""}</td>
                          </tr>`;
        return fila;
      })
    );
    let emailBody = `<head>
                          <style>
                            table {
                              font-family: arial, sans-serif;
                              border-collapse: collapse;
                              width: 100%;
                            }
                            
                            td, th {
                              border: 1px solid #dddddd;
                              text-align: left;
                              padding: 8px;
                            }
                            
                            tr:nth-child(even) {
                              background-color: #dddddd;
                            }
  
                          </style>
                        </head>
                        <body>
                          <div>
                            <p><b>Id Farmageo: </b>${transfer.id} </p>
                            <p><b>Farmacia: </b>${
                              transfer.farmacia.nombre
                            } / <b>Cuit: </b>${transfer.farmacia.cuit}</p>
                            <p><b>Telefono: </b>${
                              transfer.farmacia.telefono
                            }</p>
                            <p><b>Nro Cufe: </b>${transfer.farmacia.cufe}</p>
                            <p><b>Nro Cuenta: </b>${
                              transfer.nro_cuenta_drogueria
                            }</p> 
                            ${
                              transfer.drogueria
                                ? "<p><b>Droguería: </b>" +
                                  transfer.drogueria.nombre +
                                  "</p>"
                                : ""
                            }
                            <p><b>Laboratorio elegido: </b>${
                              transfer.laboratorio.nombre
                            }</p>
                            <p><b>Dirección: </b>${
                              transfer.farmacia.direccioncompleta
                            }</p>
                            <p><b>Fecha: </b> ${DateTime.fromISO(
                              transfer.ts_creacion
                            ).toFormat("dd/MM/yyyy  hh:mm:ss")}</p>
                            ${
                              calcularPrecio
                                ? ` <p><b>Total: </b>${total}</p>
                            <p><b>Ahorro Aproximado: </b>${ahorro}</p>`
                                : ""
                            }
                           
                          </div>
                        <table>
                            <tr>
                              <th>Código</th>
                              <th>Producto</th>
                              <th>Presentación</th>
                              <th>Cantidad</th>
                              <th>Observaciones</th>
                            </tr>
                          <tbody>
                          ${stringTable}                    
                          </tbody>
                        </table>
                      </body>`;

    return generarHtml({
      titulo: "Pedido de Transfer",
      texto: emailBody,
    });
  } catch (err) {
    console.log(err);
    return generarHtml({
      titulo: "ERROR de Transfer",
      texto: err.toString(),
    });
  }
};
