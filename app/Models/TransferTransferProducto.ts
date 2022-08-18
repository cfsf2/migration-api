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
  public id_transfer: number;
  @column()
  public cantidad: number;

  @column()
  public precio: number;

  @column()
  public observaciones: string;

  @column()
  public id_usuario_creacion: number;
  @column()
  public id_usuario_modificacion: number;
  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Transfer, {
    foreignKey: "id",
    localKey: "id_transfer",
  })
  public transfer: HasOne<typeof Transfer>;

  @hasOne(() => TransferProducto, {
    foreignKey: "id",
    localKey: "id_transfer_producto",
  })
  public transfer_producto: HasOne<typeof TransferProducto>;

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

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      if (k === "_id") return (extras[k] = this.$extras[k].toString());
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
