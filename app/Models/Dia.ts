import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class Dia extends BaseModel {
  public static table = "tbl_dia";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;
}
