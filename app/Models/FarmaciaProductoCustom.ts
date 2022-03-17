import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Usuario from "./Usuario";

export default class FarmaciaProductoCustom extends BaseModel {
  public static table = "tbl_farmacia_producto_custom";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => Farmacia, {
    foreignKey: "id",
  })
  public id_farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => ProductoCustom, {
    foreignKey: "id",
  })
  public id_producto_custom: HasOne<typeof ProductoCustom>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
