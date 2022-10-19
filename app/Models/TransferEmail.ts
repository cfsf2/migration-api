import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import { Transfer } from "App/Helper/ModelIndex";
import Base from "./Base";

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

  @belongsTo(() => Transfer, {
    localKey: "id",
    foreignKey: "id_transfer",
  })
  public transfer: BelongsTo<typeof Transfer>;
}
