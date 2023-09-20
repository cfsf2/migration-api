import {
  HasMany,
  HasOne,
  column,
  computed,
  hasMany,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import Evento from "./Evento";

export default class EventoParticipante extends Base {
  public static table = "tbl_evento_participante";
  
  @column()
  public id_evento: number;
  @column()
  public id_farmacia: number;
  @column()
  public confirmo_asistencia: string;
  @column()
  public titular: string;
  @column()
  public nombre: string;
  @column()
  public documento: number;
  @column()
  public telefono: number;
  @column()
  public gratis: string;
  @column()
  public bonificada: string;
  @column()
  public pagado: string;
  @column()
  public menor: string;
  @column()
  public id_evento_forma_pago: number;
  @column()
  public entrada_enviada: string;
  @column()
  public presente: string;
  @column()
  public mesa: number;
  @column()
  public id_evento_premio: number;
  @column()
  public matricula: number;
  @column()
  public token: string;
  @column()
  public id_titular: number;

  @hasOne(() => Evento, {
    foreignKey: "id",
    localKey: "id_evento",
  })
  public evento: HasOne<typeof Evento>;

  @hasMany(() => EventoParticipante, {
    foreignKey: "id_titular",
    localKey: "id",
  })
  public invitados: HasMany<typeof EventoParticipante>;

  @computed({ serializeAs: "costo" })
  public get costo() {
    const precio = 45000;
    
    if (this.bonificada === "s") return precio / 2;
    if (this.gratis === "s") return 0;
    if (this.menor === "s") return precio / 2;

    return precio;
  }
}
