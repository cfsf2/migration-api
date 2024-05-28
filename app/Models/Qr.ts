import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Qr extends BaseModel {
  public static table = "tbl_qr";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public abreviacion: string;

  @column()
  public habilitado: string;
}
