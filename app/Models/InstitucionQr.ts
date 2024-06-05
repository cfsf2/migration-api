import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class InstitucionQr extends BaseModel {
  public static table = "tbl_qr_institucion";
  
  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_institucion: number;

  @column()
  public id_qr: number;

  @column()
  public habilitado: string;

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
