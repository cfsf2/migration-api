import { BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { Transfer } from "App/Helper/ModelIndex";
import Mail from "@ioc:Adonis/Addons/Mail";
import Base from "./Base";
import { html_transfer } from "App/Helper/email";

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
    return Mail.send((message) => {
      message
        .from(process.env.SMTP_USERNAME as string)
        .subject("Confirmacion de pedido de Transfer" + " " + this.transfer.id)
        .html(html_transfer(this.transfer));

      this.emails
        .replace(/;/g, ",")
        .replace(/:/g, ",")
        .split(",")
        .forEach((destinatario) => message.to(destinatario));
    });
  }

  @belongsTo(() => Transfer, {
    localKey: "id",
    foreignKey: "id_transfer",
  })
  public transfer: BelongsTo<typeof Transfer>;
}
