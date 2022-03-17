import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class STipo extends BaseModel {
  public static table = "s_tipo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public descripcion: string;
}
