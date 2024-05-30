import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class InstitucionQr extends BaseModel {
  public static table = "tbl_qr_institucion";
  
  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_institucion: number;

  @column()
  public id_qr: number;

  @column()
  public habilitado: string;
}
