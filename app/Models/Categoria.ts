import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Categoria extends BaseModel {
  static async traerCategorias() {
    const datos = await Database.from("tbl_categoria as ca")
      .select("ca.habilitado", "ca.destacada", "ca.nombre", "ca.id")
      .where("habilitado", "s");

    const arrNuevo = datos.map((e) => {
      //ingreso al primer objeto
      //identifico sus keys
      const claves = Object.keys(e);
      //y luego ingreso al segundo a partir de sus propias keys
      claves.forEach((k) => {
        if (e[k] === "s") {
          e[k] = true;
        }
        if (e[k] === "n") {
          e[k] = false;
        }
      });
      //return de arrNuevo()
      return e;
    });
    //return aBoleanos()
    return arrNuevo;
  }

  public static table = "tbl_categoria";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column()
  public destacada: string;

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
    localKey: "id_usuario_creacion",
  })
  public usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario_modificacion",
  })
  public usuario_modificacion: HasOne<typeof Usuario>;
}
