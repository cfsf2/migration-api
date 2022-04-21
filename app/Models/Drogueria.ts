import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Database from "@ioc:Adonis/Lucid/Database";
import {
  boolaEnumObj,
  eliminarKeysVacios,
  enumaBool,
} from "App/Helper/funciones";

export default class Drogueria extends BaseModel {
  static async traerDroguerias({ habilitado }: { habilitado?: string }) {
    const droguerias = await Database.from("tbl_drogueria as d")
      .select("*", "d.ts_creacion as fechaalta", "d.id as _id")
      .if(habilitado, (query) => {
        query.where("habilitado", "s");
      })
      .orderBy("d.nombre", "asc");

    return droguerias.map((d) => enumaBool(d));
  }

  static async actualizarDrogueria(id, data) {
    const drog = await Drogueria.findOrFail(id);

    delete data._id;
    delete data.fechaalta;
    delete data.ts_creacion;
    delete data.ts_modificacion;

    drog.merge(eliminarKeysVacios(boolaEnumObj(data)));
    try {
      drog.save();
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  public static table = "tbl_drogueria";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_modificacion: number;

  @column()
  public id_usuario_creacion: number;

  //foreing keys
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
    return {
      _id: this.$extras._id?.toString(),
    };
  }
}
