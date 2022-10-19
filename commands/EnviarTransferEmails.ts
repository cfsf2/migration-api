import { BaseCommand } from "@adonisjs/core/build/standalone";

export default class EnviarTransferEmails extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "enviar:transfer_emails";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "";

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
      .preload("transfer");
    try {
      await Promise.all(
        transferEmailPendiente.map(async (tep) => {
          const emailRes = await tep.transfer.enviarMailAutomatico();

          tep.merge({
            enviado: "s",
            emails: JSON.stringify(emailRes.envelope.to),
            emails_rechazados:
              emailRes.rejected.length > 0
                ? JSON.stringify(emailRes.rejected)
                : null,
          });

          await tep.save();

          return emailRes;
        })
      );

      const transferEmailFallidos = await TransferEmail.query()
        .whereNotNull("emails_rechazados")
        .preload("transfer");

      await Promise.all(
        transferEmailFallidos.map(async (tep) => {
          const emails_rechazados = JSON.parse(tep.emails_rechazados as string);

          let rechazados: string[] = [];

          await Promise.all(
            emails_rechazados.map(async (e) => {
              const resEmail = await tep.transfer.enviarMail(e);
              rechazados = rechazados.concat(resEmail.rejected);
            })
          );

          await tep
            .merge({
              emails_rechazados:
                rechazados.length > 0 ? JSON.stringify(rechazados) : null,
            })
            .save();
          return;
        })
      );
    } catch (err) {
      console.log(err);
    }
    this.logger.info("Hello world!");
  }
}
