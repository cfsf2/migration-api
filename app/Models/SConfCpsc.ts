import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import SConf from "./SConf";
import STipoAtributo from "./STipoAtributo";
import Usuario from "./Usuario";

export default class SConfCpsc extends BaseModel {
  public static table = "s_conf_cpsc";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_conf: number;

  @column()
  public id_tipo_atributo: number;

  @column()
  public valor: string;

  @column()
  public evaluar: string;

  @column()
  public sql: string;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => SConf, {
    localKey: "id_conf",
    foreignKey: "id",
  })
  public conf: HasOne<typeof SConf>;

  @hasOne(() => STipoAtributo, {
    localKey: "id_tipo_atributo",
    foreignKey: "id",
  })
  public tipo_atributo: HasOne<typeof STipoAtributo>;

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
