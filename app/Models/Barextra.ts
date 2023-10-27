import { DateTime } from "luxon";
import { BaseModel, HasOne, column, hasOne } from "@ioc:Adonis/Lucid/Orm";
import Producto from "./Producto";

export default class Barextra extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public nro_registro_prod: number;

  @column()
  public cod_barras: number;

  @hasOne(() => Producto, {
    localKey: "cod_barras",
    foreignKey: "cod_barras",
  })
  public producto: HasOne<typeof Producto>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
