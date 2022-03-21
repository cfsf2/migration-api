import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Transfer from "./Transfer";
import TransferProducto from "./TransferProducto";
import Usuario from "./Usuario";

export default class TransferTransferProducto extends BaseModel {
  public static table = "tbl_transfer_transfer_producto";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public cuit: number;

  @column()
  public id_transfer_producto: number;

  @column()
  public cantidad: number;

  @column()
  public precio: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Transfer, {
    foreignKey: "id",
  })
  public id_transfer: HasOne<typeof Transfer>;

  @hasOne(() => TransferProducto, {
    foreignKey: "id",
  })
  public id_productotransfer: HasOne<typeof TransferProducto>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
