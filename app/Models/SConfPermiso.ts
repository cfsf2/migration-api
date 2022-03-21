import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import SConf from "./SConf";
import Permiso from "./Permiso";

export default class SConfPermiso extends BaseModel {
  public static table = "s_conf_permiso";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public ver: string;

  @column()
  public alta: string;

  @column()
  public baja: string;

  @column()
  public modificar: string;

  @hasOne(() => SConf, {
    foreignKey: "id",
  })
  public id_conf: HasOne<typeof SConf>;

  @hasOne(() => Permiso, {
    foreignKey: "id",
  })
  public id_permiso: HasOne<typeof Permiso>;
}
