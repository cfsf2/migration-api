import { DateTime } from "luxon";
import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Drogueria from "./Drogueria";

export default class FarmaciaDrogueria extends BaseModel {
  public static table = "tbl_farmacia_drogueria";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_farmacia: number;

  @column()
  public id_drogueria: number;

  @column()
  public nro_cuenta: number;

  @column()
  public descuento: number;

  @column()
  public id_usuario_creacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @belongsTo(() => Farmacia, {
    localKey: "id",
    foreignKey: "id_farmacia",
  })
  public farmacia: BelongsTo<typeof Farmacia>;

  @belongsTo(() => Drogueria, {
    localKey: "id",
    foreignKey: "id_drogueria",
  })
  public drogueria: BelongsTo<typeof Drogueria>;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
