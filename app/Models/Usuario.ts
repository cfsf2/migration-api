import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  HasMany,
  hasMany,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Localidad from "./Localidad";
import CampanaRequerimiento from "./CampanaRequerimiento";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Usuario extends BaseModel {
  static async traerPerfilDeUsuario({
    usuarioNombre,
  }: {
    usuarioNombre: String;
  }) {
    const usuario = await Database.from("tbl_usuario")
      .select(
        Database.raw(
          `tbl_usuario.*, 
          tbl_usuario.nombre as name, 
          tbl_usuario.fecha_nac as fechaNac, 
          tbl_usuario.telefono as telephone, 
          tbl_usuario.f_ultimo_acceso as ultimoacceso, 
          tbl_usuario.ts_creacion as fecha_alta, 
          tbl_usuario.ts_modificacion as fecha_modificacion,
          tbl_localidad.nombre as localidad,
          tbl_usuario_perfil.id_perfil as perfil
          ` 
        )
      )
      .leftJoin(`tbl_localidad`, `tbl_usuario.id_localidad`, `tbl_localidad.id`)
      .leftJoin(
        `tbl_usuario_perfil`,
        `tbl_usuario.id`,
        `tbl_usuario_perfil.id_usuario`
      )
      .where("usuario", usuarioNombre.toString());

    let permisos = await Database.from("tbl_perfil_permiso")
      .select(Database.raw(`tipo`))
      .leftJoin(
        `tbl_permiso`,
        `tbl_perfil_permiso.id_permiso`,
        `tbl_permiso.id`
      )
      .where("tbl_perfil_permiso.id_perfil", usuario[0].perfil)
      .groupBy("tipo");

    let arrNuevo: string[] = [];
    permisos.forEach((i) => {
      arrNuevo.push(i.tipo);
      return arrNuevo;
    });
    
    usuario[0].permisos = arrNuevo
    const formateo = usuario.map( (e) => {
        const claves = Object.keys(e);
        claves.forEach((k) => {
          if (e[k] === "s") {
            e[k] = true;
          }
          if (e[k] === "n") {
            e[k] = false;
          }
        });
  
        return e;
    })

    return formateo;
  }

  public static table = "tbl_usuario";

  @column({ isPrimary: true })
  public id: Number;

  @column()
  public usuario: String;

  @column()
  public nombre: String;

  @column()
  public apellido: String;

  @column()
  public dni: Number;

  @column()
  public fecha_nac: Date;

  @column()
  public email: String;

  @column({ serializeAs: null })
  public password: String;

  @column()
  public newsletter: String;

  @column()
  public habilitado: String;

  @column()
  public esfarmacia: String;

  @column()
  public admin: String;

  @column()
  public confirmado: String;

  @column()
  public telefono: String;

  @column.dateTime()
  public f_ultimo_acceso: DateTime;

  @column()
  public deleted: String;

  @column()
  public demolab: String;

  @column()
  public id_wp: String;

  @column.dateTime({ autoCreate: true })
  public ts_creacion: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public ts_modificacion: DateTime;

  @column()
  public celular: String;

  @column()
  public id_localidad: Number;

  @column()
  public permisos: String;

  @column()
  public perfil: Number;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_creacion: HasOne<typeof Usuario>;

  @hasOne(() => Localidad, {
    foreignKey: "id",
  })
  public localidad: HasOne<typeof Localidad>;

  @hasOne(() => Usuario, {
    foreignKey: "id",
  })
  public id_usuario_modificacion: HasOne<typeof Usuario>;

  @hasMany(() => CampanaRequerimiento, {
    foreignKey: "id_usuario",
  })
  public requerimientos: HasMany<typeof CampanaRequerimiento>;

  // Campos locos especificamente diseñados para que siga funcionando la aplicacion sin cambiar el frontend
  public give_user_display_name() {
    return this.nombre + " " + this.apellido;
  }
  @column()
  public user_display_name: String;

  @column()
  public user_email: String;

  @column()
  public token: String;
}
