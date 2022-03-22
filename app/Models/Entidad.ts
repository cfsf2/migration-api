import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Entidad extends BaseModel {
  static async traerEntidades() {
    const datos = await Database.from("tbl_entidad").select("*");

    const arrNuevo = datos.map((e) => {
      const claves = Object.keys(e);
      claves.forEach((k) => {
        if (e[k] === "s") {
          e[k] = true;
        }
        if (e[k] === "n") {
          e[k] = false;
        }
      });

      return e;
    });
    return arrNuevo;
  }

  public static table = "tbl_entidad";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column()
  public imagen: string;

  @column()
  public logo: string;

  @column()
  public titulo: string;

  @column()
  public email: string;

  @column()
  public rentabilidad: string;

  @column()
  public mostrar_en_proveeduria: string;

  @column()
  public id_usuario_creacion: Number;

  @column()
  public id_usuario_modificacion: Number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;
}
