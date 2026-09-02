import { column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class LaboratorioModalidadEntrega extends Base {
  public static table = "tbl_laboratorio_modalidad_entrega";

  @column()
  public id_a: string;

  @column()
  public nombre: string;
}
