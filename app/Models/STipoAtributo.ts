import { BaseModel, column, hasOne, HasOne } from "@ioc:Adonis/Lucid/Orm";
import STipo from "./STipo";
import SAtributo from "./SAtributo";

export default class STipoAtributo extends BaseModel {
  public static table = "s_tipo_atributo";

  @column({ isPrimary: true })
  public id: number;

  //foreing key
  @hasOne(() => STipo, {
    foreignKey: "id",
  })
  public id_tipo: HasOne<typeof STipo>;

  @hasOne(() => SAtributo, {
    foreignKey: "id",
  })
  public id_atributo: HasOne<typeof SAtributo>;
}
