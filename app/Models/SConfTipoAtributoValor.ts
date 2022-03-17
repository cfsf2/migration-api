import { BaseModel, column, HasOne, hasOne } from "@ioc:Adonis/Lucid/Orm";

export default class SConfTipoAtributoValor extends BaseModel {
  public static table = "s_conf_tipo_atributo_valor";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public valor: string;

  @column()
  public evaluar: string;

  @column()
  public sql: string;

  @hasOne(() => SConf, {
    foreignKey: "id",
  })
  public id_conf: HasOne<typeof SConf>;

  @hasOne(() => STipoAtributo, {
    foreignKey: "id",
  })
  public id_tipo_atributo: HasOne<typeof STipoAtributo>;
}
