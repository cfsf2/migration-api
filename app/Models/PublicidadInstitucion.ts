import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Publicidad from "./Publicidad";
import Institucion from "./Institucion";

export default class PublicidadInstitucion extends BaseModel {
  public static table = "tbl_publicidad_institucion";

  @column({ isPrimary: true })
  public id: number;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_publicidad: number;

  //foreing keys

  // @hasOne(() => Publicidad, {
  //   foreignKey: "id",
  // })
  // public id_publicidad: HasOne<typeof Publicidad>;

  @column()
  public id_institucion: number;

  @hasOne(() => Institucion, {
    foreignKey: "id",
  })
  public institucion: HasOne<typeof Institucion>;

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
