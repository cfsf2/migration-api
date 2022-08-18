import {
  BaseModel,
  column,
  HasManyThrough,
  hasManyThrough,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import SAtributo from "./SAtributo";
import SConf from "./SConf";
import STipoAtributo from "./STipoAtributo";

export default class SConfTipoAtributoValor extends BaseModel {
  public static table = "s_conf_tipo_atributo_valor";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public valor: string;

  @column()
  public id_conf: number;

  @column({ serializeAs: null })
  public id_tipo_atributo: number;

  @column()
  public evaluar: string;

  @column()
  public sql: string;

  @column()
  public subquery: string;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => SConf, {
    foreignKey: "id",
    localKey: "id_conf",
  })
  public conf: HasOne<typeof SConf>;

  @hasOne(() => STipoAtributo, {
    foreignKey: "id",
    localKey: "id_tipo_atributo",
  })
  public tipo_atributo: HasOne<typeof STipoAtributo>;

  @hasManyThrough([() => SAtributo, () => STipoAtributo], {
    localKey: "id_tipo_atributo",
    foreignKey: "id",
    throughLocalKey: "id_atributo",
    throughForeignKey: "id",
  })
  public atributo: HasManyThrough<typeof SAtributo>;

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
