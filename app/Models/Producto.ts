import { BaseModel, column, computed } from "@ioc:Adonis/Lucid/Orm";

export default class Producto extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public cod_barras: string;

  @column()
  public precio: string;

  @column()
  public nombre: string;

  @column()
  public presentacion: string;

  static get computed() {
    return ["precio"];
  }

  @computed({ serializeAs: "precio" })
  public get precioDividido() {
    return parseFloat(this.precio) / 100;
  }
}
