import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import ProductoPack from "./ProductoPack";
import SolicitudProveeduria from "./SolicitudProveeduria";
import Usuario from "./Usuario";

export default class SolicitudProveeduriaProductoPack extends BaseModel {
  public static table = "tbl_solicitud_proveeduria_producto_pack";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_solicitud_proveeduria: number;

  @column()
  public id_producto_pack: number;

  @column()
  public cantidad: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  //foreing key
  @hasOne(() => ProductoPack, {
    foreignKey: "id",
  })
  public id_productopack: HasOne<typeof ProductoPack>;

  @hasOne(() => SolicitudProveeduria, {
    foreignKey: "id",
  })
  public id_solicitudproveeduria: HasOne<typeof SolicitudProveeduria>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

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
