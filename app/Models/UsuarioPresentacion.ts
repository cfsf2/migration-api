import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";

export default class UsuarioPresentacion extends BaseModel {
  public static table = "tbl_usuario_presentacion";

  @column({ isPrimary: true })
  public id: number;

  @column()
  public id_usuario: number;

  @column()
  public id_presentacion: number;

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
