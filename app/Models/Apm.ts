import { column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Laboratorio from "./Laboratorio";
import Base from "./Base";

export default class Apm extends Base {
  public static table = "tbl_apm";

  @column()
  public nombre: string;

  @column()
  public email: string;

  @column()
  public usa_sistema: string;

  @column()
  public habilitado: string;

  @column()
  public id_laboratorio: number;

  @hasOne(() => Laboratorio, {
    foreignKey: "id",
    localKey: "id_laboratorio",
  })
  public laboratorio: HasOne<typeof Laboratorio>;

  @column()
  public id_usuario: number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;
}
