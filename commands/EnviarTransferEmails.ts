import { BaseCommand } from "@adonisjs/core/build/standalone";
import Mail from "@ioc:Adonis/Addons/Mail";
import { generarHtml, html_transfer } from "App/Helper/email";

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

    const transferEmailPendiente = await TransferEmail.query()
      .where("enviado", "n")
      .preload("transfer", (query) =>
        query
          .preload("ttp", (query) => query.preload("transfer_producto"))
          .preload("productos")
          .preload("laboratorio")
          .preload("farmacia")
          .preload("drogueria")
      );
    try {
      await Promise.all(
        transferEmailPendiente.map(async (tep) => {
          const emailRes = await tep.Enviar();

          tep.merge({
            enviado: "s",
            emails: emailRes.envelope.to.toString(),
            emails_rechazados:
              emailRes.rejected.length > 0
                ? emailRes.rejected.split(",")
                : null,
          });

          if (emailRes.rejected.length > 0) {
            Mail.send((message) => {
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
                      emailRes.rejected.toString() +
                      " rechazaron la recepcion del email de transfer.",
                  })
                );
            });
          }
          await tep.save();

          return emailRes;
        })
      );
    } catch (err) {
      console.log(err);
    }
    this.logger.info("Transfers Enviados");
  }
}
