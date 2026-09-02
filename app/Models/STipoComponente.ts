import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import STipo from "./STipo";
import SComponente from "./SComponente";

export default class STipoComponente extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_componente: number;

  @column()
  public id_tipo: number;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => STipo, {
    foreignKey: "id",
    localKey: "id_tipo",
  })
  public tipo: HasOne<typeof STipo>;

  @hasOne(() => SComponente, {
    foreignKey: "id",
    localKey: "id_componente",
  })
  public componente: HasOne<typeof SComponente>;

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
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}
