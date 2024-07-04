import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class QrPresentacion extends BaseModel {
  public static table = "tbl_qr_presentacion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_presentacion: number;

  @column()
  public id_qr: number;

  @column()
  public habilitado: string;

  public serializeExtras() {
    const keys = Object.keys(this.$extras);
    const extras = {};
    keys.forEach((k) => {
      extras[k] = this.$extras[k];
    });
    return extras;
  }
}

