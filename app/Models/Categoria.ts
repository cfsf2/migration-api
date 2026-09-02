import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Categoria extends BaseModel {
  static async traerCategorias({ habilitado }: { habilitado?: string }) {
    const datos = await Database.from("tbl_categoria as ca")
      .select("ca.habilitado", "ca.destacada", "ca.nombre", "ca.id")
      .if(habilitado, (query) => {
        query.where("habilitado", "s");
      });

    const arrNuevo = datos.map((e) => {
      //ingreso al primer objeto
      //identifico sus keys
      e._id = e.id.toString();
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
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

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
