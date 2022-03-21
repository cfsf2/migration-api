import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class CampanaAtributo extends BaseModel {
  public static table = "tbl_campana_atributo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public codigo: string;

  @column()
  public descripcion: string;
}
