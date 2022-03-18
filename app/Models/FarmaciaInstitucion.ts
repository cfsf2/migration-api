import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Farmacia from "./Farmacia";
import Institucion from "./Institucion";
import Usuario from "./Usuario";

export default class FarmaciaInstitucion extends BaseModel {
  public static table = "tbl_farmacia_institucion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Farmacia, {
    foreignKey: "id",
  })
  public id_farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Institucion, {
    foreignKey: "id",
  })
  public d_institucion: HasOne<typeof Institucion>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;
}
