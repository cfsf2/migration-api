import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class PedidoProductoPack extends BaseModel {
  public static table = "tbl_publicidad_color";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public rgb: string;
}
