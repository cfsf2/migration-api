import { column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class LaboratorioTipoComunicacion extends Base {
  public static table = "tbl_laboratorio_tipo_comunicacion";
  @column()
  public id_a: string;

  @column()
  public nombre: string;
  /**/
}
