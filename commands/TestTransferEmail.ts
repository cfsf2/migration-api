import { BaseCommand } from "@adonisjs/core/build/standalone";
import { html_transfer } from "../app/Helper/email";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class TestTransferEmail extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "test:transfer_email";

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
    const { default: TransferEmail } = await import(
      "../app/Models/TransferEmail"
    );

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

    return await Promise.all(
      transferEmailPendiente.map(async (tep) => {
        try {
          await tep.load("transfer", (q) =>
            q
              .preload("ttp", (q) =>
                q.preload("transfer_producto", (q) =>
                  q.preload("barextra_producto").preload("producto")
                )
              )
              .preload("productos")
              .preload("farmacia")
              .preload("drogueria")
              .preload("laboratorio")
          );

          const htmlTransfer = await html_transfer(tep.transfer);
          console.log(htmlTransfer);
          try {
            return Mail.send(async (message) => {
              message
                .to(process.env.SISTEMAS_EMAIL as string)
                .subject(
                  "Confirmacion de pedido de Transfer" + " " + tep.transfer.id
                )
                .html(htmlTransfer);
            });
          } catch (err) {
            console.log("testrasferemail", err);

            return Mail.send(async (message) => {
              message
                .to(process.env.SISTEMAS_EMAIL as string)
                .subject(
                  "Confirmacion de pedido de Transfer" + " " + tep.transfer.id
                )
                .html(err);
            });
          }
        } catch (err) {
          console.log(err);
          return err;
        }
      })
    );
  }
}
