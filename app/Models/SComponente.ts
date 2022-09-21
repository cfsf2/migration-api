import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  hasManyThrough,
  HasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import SAtributo from "./SAtributo";
import STipoAtributo from "./STipoAtributo";

export default class SComponente extends BaseModel {
  public static table = "s_componente";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @hasManyThrough([() => SAtributo, () => STipoAtributo], {
    localKey: "id",
    foreignKey: "id_componente",
    throughLocalKey: "id_atributo",
    throughForeignKey: "id",
  })
  public atributos: HasManyThrough<typeof SAtributo>;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

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
