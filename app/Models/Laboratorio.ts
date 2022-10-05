import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import { enumaBool } from "App/Helper/funciones";

export default class Laboratorio extends BaseModel {
  static async traerLaboratorios({ id }: { id?: number }) {
    const laboratorios = await Database.from("tbl_laboratorio as l")
      .select("*", "l.id as _id", "l.id as id", "l.ts_creacion as fechaalta")
      .if(id, (query) => query.where("id", id))
      .orderBy("fechaalta", "desc");

    let result = laboratorios.map((l) => {
      l._id = l._id.toString();
      enumaBool(l);
      return l;
    });

    if (result.length === 1) return result[0];
    return result;
  }

  public static table = "tbl_laboratorio";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column()
  public imagen: string;

  @column()
  public novedades: string;

  @column()
  public condiciones_comerciales: string;

  @column()
  public transfer_farmageo: string;

  @column()
  public url: string;

  @column()
  public email: string;

  @column()
  public usa_sistema: string;

  @column()
  public tiene_apms: string;

  @column()
  public permite_nro_cuenta: string;

  @column()
  public id_usuario: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

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

  @hasOne(() => Usuario, {
    foreignKey: "id",
    localKey: "id_usuario",
  })
  public usuario: HasOne<typeof Usuario>;

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
