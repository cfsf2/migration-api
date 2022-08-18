import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import TransferProducto from "./TransferProducto";
import Usuario from "./Usuario";
import Institucion from "./Institucion";

export default class TransferProductoInstitucion extends BaseModel {
  public static table = "tbl_transfer_producto_institucion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_transfer_producto: number;

  @column()
  public id_institucion: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_transfer_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => TransferProducto, {
    foreignKey: "id",
    localKey: "id_transfer_producto",
  })
  public productotransfer: HasOne<typeof TransferProducto>;

  @hasOne(() => Institucion, {
    foreignKey: "id",
    localKey: "id_institucion",
  })
  public institucion: HasOne<typeof Institucion>;

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
