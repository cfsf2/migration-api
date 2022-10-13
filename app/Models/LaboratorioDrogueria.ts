import { column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";

import Base from "./Base";
import Drogueria from "./Drogueria";
import Laboratorio from "./Laboratorio";

export default class ApmFarmacia extends Base {
  public static table = "tbl_laboratorio_drogueria";

  @column()
  public id_laboratorio: number;

  @column()
  public id_farmacia: number;

  @column()
  public id_apm: number;

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;

  @hasOne(() => Drogueria, {
    foreignKey: "id",
    localKey: "id_drogueria",
  })
  public drogueria: HasOne<typeof Drogueria>;
}
