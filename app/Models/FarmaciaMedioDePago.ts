import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Farmacia from "./Farmacia";
import MedioDePago from "./MedioDePago";

export default class FarmaciaMedioDePago extends BaseModel {
  public static table = "tbl_farmacia_mediodepago";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_farmacia: number;

  @column()
  public id_mediodepago: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => MedioDePago, {
    foreignKey: "id",
    localKey: "id_mediodepago",
  })
  public mediodepago: HasOne<typeof MedioDePago>;

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
