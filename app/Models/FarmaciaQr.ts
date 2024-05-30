import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class FarmaciaQr extends BaseModel {
  public static table = "tbl_qr_farmacia";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_farmacia: number;

  @column()
  public id_qr: number;

  @column()
  public habilitado: string;
}
