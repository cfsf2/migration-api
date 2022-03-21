import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class CampanaResponsable extends BaseModel {
  public static table = "tbl_campana_responsable";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;
}
