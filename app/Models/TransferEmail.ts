import { BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { Transfer } from "App/Helper/ModelIndex";
import Mail from "@ioc:Adonis/Addons/Mail";
import Base from "./Base";
import { html_transfer } from "App/Helper/email";

import Env from "@ioc:Adonis/Core/Env";

export default class TransferEmail extends Base {
  public static table = "tbl_transfer_email";

  @column()
  public id_transfer: number;

  @column()
  public emails: string;

  @column()
  public emails_rechazados: string | null;

  @column()
  public enviado: string;

  public async Enviar() {
    let htmlTransfer;
    try {
      htmlTransfer = await html_transfer(this.transfer);
    } catch (err) {
      console.log(err);
    }
    const entorno = Env.get("ENTORNO") === "produccion";
    const subject =
      (entorno
        ? "Confirmacion de pedido de Transfer"
        : "TRANSFER FICTICIO DE PRUEBA Pedido de Transfer") +
      " " +
      this.transfer.id;
    return Mail.send(async (message) => {
      message
        .from(process.env.SMTP_USERNAME as string)
        .subject(subject)
        .html(htmlTransfer);

      this.emails
        .replace(/;/g, ",")
        .replace(/:/g, ",")
        .split(",")
        .forEach((destinatario) => message.to(destinatario));
    });
    return htmlTransfer;
  }

  @belongsTo(() => Transfer, {
    localKey: "id",
    foreignKey: "id_transfer",
  })
  public transfer: BelongsTo<typeof Transfer>;
}
