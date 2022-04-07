import { DateTime, NumberUnitLength } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Farmacia from "./Farmacia";
import Servicio from "./Servicio";

export default class FarmaciaServicio extends BaseModel {
  public static table = "tbl_farmacia_servicio";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_farmacia: Number;

  @column()
  public id_servicio: Number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Servicio, {
    foreignKey: "id",
    localKey: "id_servicio",
  })
  public servicio: HasOne<typeof Servicio>;
}
