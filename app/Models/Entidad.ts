import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Entidad extends BaseModel {
  static async traerEntidades({ habilitado }: { habilitado?: string }) {
    const datos = await Database.from("tbl_entidad as e")
      .select(
        "*",
        "e.id as _id",
        "e.nombre as entidadnombre",
        "e.titulo as nombre",
        "e.mostrar_en_proveeduria as no_mostrar_en_proveeduria"
      )
      .if(habilitado, (query) => {
        query.where("habilitado", "s");
      });

    const arrNuevo = datos.map((e) => {
      e.no_mostrar_en_proveeduria =
        e.no_mostrar_en_proveeduria === "s" ? false : true;
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
