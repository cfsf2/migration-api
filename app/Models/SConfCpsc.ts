import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import SConf from "./SConf";

export default class SConfCpsc extends BaseModel {
  public static table = "s_conf_cpsc";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public orden: number;

  @column()
  public condicion: string;

  @column()
  public evaluar: string;

  @column()
  public sql: string;

  @hasOne(() => SConf, {
    foreignKey: "id",
  })
  public id_conf: HasOne<typeof SConf>;

  @hasOne(() => SConf, {
    foreignKey: "id",
  })
  public id_conf_h: HasOne<typeof SConf>;
}
