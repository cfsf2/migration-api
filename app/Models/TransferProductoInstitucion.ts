import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import TransferProducto from "./TransferProducto";
import Usuario from "./Usuario";
import Institucion from "./Institucion";

export default class PedidoProductoPack extends BaseModel {
  public static table = "tbl_transfer_producto_institucion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_transfer_producto: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => TransferProducto, {
    foreignKey: "id",
  })
  public id_productotransfer: HasOne<typeof TransferProducto>;

  @hasOne(() => Institucion, {
    foreignKey: "id",
  })
  public id_institucion: HasOne<typeof Institucion>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
