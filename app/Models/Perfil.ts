import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasMany,
  HasManyThrough,
  hasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Permiso from "./Permiso";
import PerfilPermiso from "./PerfilPermiso";

export default class Perfil extends BaseModel {
  public static table = "tbl_perfil";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public nombre: string;

  @column()
  public descripcion: string;

  @column()
  public tipo: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasManyThrough([() => Permiso, () => PerfilPermiso], {
    localKey: "id",
    foreignKey: "id_perfil",
    throughLocalKey: "id_permiso",
    throughForeignKey: "id",
  })
  public permisos: HasManyThrough<typeof Permiso>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

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
