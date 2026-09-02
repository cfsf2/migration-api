import { column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Apm from "./Apm";
import Base from "./Base";
import Farmacia from "./Farmacia";
import Laboratorio from "./Laboratorio";

export default class ApmFarmacia extends Base {
  public static table = "tbl_apm_farmacia";

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

  @hasOne(() => Farmacia, {
    foreignKey: "id",
    localKey: "id_farmacia",
  })
  public farmacia: HasOne<typeof Farmacia>;

  @hasOne(() => Apm, {
    foreignKey: "id",
    localKey: "id_apm",
  })
  public apm: HasOne<typeof Apm>;
}
