import { DateTime } from "luxon";
import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import Usuario from "./Usuario";
import { guardarDatosAuditoria, AccionCRUD } from "App/Helper/funciones";

export default class Repoo extends BaseModel {
  static async actualizar({
    data,
    file,
    auth,
  }: {
    data: any;
    file?: any;
    auth: Usuario;
  }) {
    const { oossInactivas, alert } = data;

    try {
      if (file && file.isValid) {
        try {
          file.moveToDisk(
            "ooss/",
            {
              name: "ooss.pdf",
              contentType: "application/pdf",
              cacheControl: "no-cache",
              visibility: "public",
            },
            "s3"
          );
        } catch (err) {
          console.log(err);
          return err;
        }
      }
      if (file && !file.isValid) {
        throw { msg: "imagen no valida" };
      }
      const repos = await Repoo.query();
      const repo = repos.pop();
      repo?.merge({
        oossInactivas: oossInactivas ? Array.isArray(oossInactivas) ? JSON.stringify(oossInactivas) : JSON.stringify([oossInactivas]) : JSON.stringify([]),
        alert: alert,
      });
      guardarDatosAuditoria({
        objeto: repo,
        usuario: auth,
        accion: AccionCRUD.crear,
      });

      return await repo?.save();
    } catch (err) {
      console.log(err);
      err.status = 409;
      return err;
    }
  }
  public static table = "tbl_repoo";

  @column({ isPrimary: true })
  public id: number;

  @column({ columnName: "oossInactivas", serializeAs: "oossInactivas" })
  public oossInactivas: string;

  @column()
  public available: string;

  @column()
  public alert: string;

  @column()
  public attachName: string;

  @column()
  public mimetype: string;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public id_usuario_creacion: number;

  @column()
  public id_usuario_modificacion: number;

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
