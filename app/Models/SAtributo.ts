import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class PedidoProductoPack extends BaseModel {
  public static table = "s_atributo";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public descripcion: string;
}
