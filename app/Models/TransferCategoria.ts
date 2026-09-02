import { column } from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";

export default class TransferCategoria extends Base {
  public static table = "tbl_transfer_categoria";

  @column()
  public nombre: string;

  @column()
  public habilitado: string;

  @column()
  public orden: number;
}
