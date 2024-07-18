import { BaseCommand } from "@adonisjs/core/build/standalone";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml } from "App/Helper/email";
import { _log } from "App/Helper/funciones";
import { DateTime } from "luxon";

export default class EnviarTransferEmails extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "enviar:transfer_emails";

  /**
   * Command description is displayed in the "help" output
   */
  public static description =
    "Envia Emails de Transfer que se encuentren pendientes";

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  public async run() {
    const { default: TransferEmail } = await import("App/Models/TransferEmail");

    const teps: any[] = [];
    const teps_error: any[] = [];

    const transferEmailPendiente = await TransferEmail.query()
      .where("enviado", "n")
      .preload("transfer", (query) =>
        query
          .preload("ttp", (query) => query.preload("transfer_producto"))
          .preload("productos")
          .preload("laboratorio")
          .preload("farmacia")
          .preload("drogueria")
      )
      .orderBy("ts_creacion", "asc");
    await Promise.all(
      transferEmailPendiente.map(async (tep) => {
        try {
          let emailRes;
          try {
            emailRes = await tep.Enviar();
          } catch (err) {
            console.log(err);
          }
          tep.merge({
            enviado: "s",
            emails: emailRes.envelope.to.toString(),
            emails_rechazados:
              emailRes.rejected.length > 0
                ? emailRes.rejected.toString()
                : null,
          });

          if (emailRes.rejected.length > 0) {
            await Mail.send((message) => {
              message
                .from(process.env.SMTP_USERNAME as string)
                .to(process.env.TRANSFER_EMAIL as string)
                .subject(
                  "El transfer con Id" +
                    " " +
                    tep.transfer.id +
                    " no pudo ser enviado correctamente"
                )
                .html(
                  generarHtml({
                    titulo:
                      "Transfer " +
                      tep.transfer.id +
                      " no pudo ser enviado correctamente",
                    texto:
                      "Los destinatarios " +
                      emailRes.rejected?.toString() +
                      " rechazaron la recepcion del email de transfer." +
                      "<br/>" +
                      "El sistema no intentara enviar el email nuevamente." +
                      "<hr/>" +
                      "<code>" +
                      emailRes.rejectedErrors.toString() +
                      "</code>",
                  })
                );
            });
          }

          const now = DateTime.now().toFormat("dd-MM-yyyy HH-mm-ss");

          teps.push({
            id: tep.id,
            transfer_id: tep.id_transfer,
            email: tep.emails,
          });

          try {
            await _log(
              `Transfer Emails Enviados ${DateTime.now().toFormat(
                "dd-MM-yyyy"
              )}`,
              {
                now,
                transfer_email_enviado: {
                  id: tep.id,
                  transfer_id: tep.id_transfer,
                  email: tep.emails,
                },
              }
            );
          } catch (err) {
            console.log("error de escritura", err);
          }

          await tep.save();
          return emailRes;
        } catch (err) {
          const now = DateTime.now().toFormat("dd-MM-yyyy HH-mm-ss");
          await _log(
            `Transfer Emails Error $${DateTime.now().toFormat("dd-MM-yyyy")}`,
            {
              now,
              err,
              transfer_email_error: {
                id: tep.id,
                transfer_id: tep.id_transfer,
                email: tep.emails,
              },
            }
          );
          await Mail.send((message) => {
            message
              .from(process.env.SMTP_USERNAME as string)
              .to(process.env.TRANSFER_EMAIL as string)
              .subject(
                "El transfer con Id" +
                  " " +
                  tep.transfer.id +
                  " no pudo ser enviado correctamente"
              )
              .html(
                generarHtml({
                  titulo:
                    "Transfer " +
                    tep.transfer.id +
                    " no pudo ser enviado correctamente",
                  texto:
                    "Destinatarios no alcanzados: " +
                    tep.emails +
                    "<br/>" +
                    "El sistema no intentara enviar el email nuevamente." +
                    "<hr/>" +
                    "<code>" +
                    err.toString() +
                    "</code>",
                })
              );
          });

          await tep
            .merge({
              enviado: "s",
              emails_rechazados: err.rejected?.toString(),
            })
            .save();

         

          return err;
        }
      })
    );
    this.logger.success("Transfers Enviados");
  }
}
