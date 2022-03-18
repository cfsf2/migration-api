import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Farmacia from "./Farmacia";

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

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Farmacia, {
    foreignKey: "id",
  })
  public id_farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Servicio, {
    foreignKey: "id",
  })
  public id_servicio: HasOne<typeof Servicio>;
}
