import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class CampanaOrientado extends BaseModel {
  public static table = "tbl_campana_orientado";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public tabla: string;
}
