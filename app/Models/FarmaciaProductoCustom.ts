import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";
import ProductoCustom from "./ProductoCustom";

export default class FarmaciaProductoCustom extends BaseModel {
  public static table = "tbl_farmacia_producto_custom";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public habilitado: string;

  @column()
  public en_papelera: string;

  @column()
  public id_farmacia: number;

  @column()
  public id_producto_custom: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => ProductoCustom, {
    foreignKey: "id",
    localKey: "id_producto_custom",
  })
  public producto_custom: HasOne<typeof ProductoCustom>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;
}
