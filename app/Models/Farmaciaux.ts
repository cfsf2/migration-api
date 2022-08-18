import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import Provincia from "./Provincia";

export default class Farmaciaux extends BaseModel {
  public static table = "_farmaciauxs";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public matricula: number;

  @column()
  public usuario: string;

  @column()
  public password: string;

  @column()
  public nombre: string;

  @column()
  public nombrefarmaceutico: string;

  @column()
  public telefono: string;

  @column()
  public cuit: string;

  @column()
  public cufe: number;

  @column()
  public calle: string;

  @column()
  public numero: number;

  @column()
  public cp: string;

  @column()
  public email: string;

  @column()
  public codigo: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
  })
  public id_localidad: HasOne<typeof Localidad>;

  @hasOne(() => Provincia, {
    foreignKey: "id",
  })
  public id_provincia: HasOne<typeof Provincia>;

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
