import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import STipo from "./STipo";

export default class SConf extends BaseModel {
  public static table = "s_conf";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public permiso: string;

  @column()
  public id_a: string;

  @hasOne(() => STipo, {
    foreignKey: "id",
  })
  public id_tipo: HasOne<typeof STipo>;
}
