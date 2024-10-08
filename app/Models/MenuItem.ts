import {
  BelongsTo,
  belongsTo,
  column,
  hasMany,
  HasMany,
  HasManyThrough,
  hasManyThrough,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import Base from "./Base";
import Menu from "./Menu";
import MenuItemCpsc from "./MenuItemCpsc";
import MenuItemTipo from "./MenuItemTipo";
import MenuItemPermiso from "./MenuItemPermiso";
import MenuItemInstitucion from "./MenuItemInstitucion";
import SConf from "./SConf";
import Permiso from "./Permiso";

export default class MenuItem extends Base {
  public static table = "tbl_menu_item";

  @column()
  public nombre: string;

  @column()
  public url: string;

  @column({ serializeAs: null })
  public id_menu: number;

  @column()
  public url_imagen: string;

  @column()
  public target: string;

  @column()
  public orden: number;

  @column()
  public permiso: string;

  @column()
  public id_a_conf: string;

  @hasOne(() => SConf, {
    localKey: "id_a_conf",
    foreignKey: "id_a",
  })
  public conf: HasOne<typeof SConf>;

  @column({ serializeAs: null })
  public id_menu_item_tipo: number;

  @hasOne(() => Menu, {
    localKey: "id_menu",
    foreignKey: "id",
  })
  public menu: HasOne<typeof Menu>;

  @belongsTo(() => MenuItemTipo, {
    foreignKey: "id_menu_item_tipo",
    localKey: "id",
  })
  public tipo: BelongsTo<typeof MenuItemTipo>;

  @belongsTo(() => MenuItemPermiso, {
    localKey: "id_menu_item",
    foreignKey: "id",
  })
  public Permiso: BelongsTo<typeof MenuItemPermiso>;

  @belongsTo(() => MenuItemInstitucion, {
    localKey: "id_menu_item",
    foreignKey: "id",
  })
  public institucion: BelongsTo<typeof MenuItemInstitucion>;


  @hasManyThrough([() => Permiso, () => MenuItemPermiso], {
    localKey: "id",
    foreignKey: "id_menu_item",
    throughLocalKey: "id_permiso",
    throughForeignKey: "id",
  })
  public permisos: HasManyThrough<typeof Permiso>;

  @hasManyThrough([() => MenuItem, () => MenuItemCpsc], {
    localKey: "id",
    foreignKey: "id_menu_item",
    throughLocalKey: "id_menu_item_hijo",
    throughForeignKey: "id",
  })
  public hijos: HasManyThrough<typeof MenuItem>;

  @hasMany(() => MenuItemCpsc, {
    localKey: "id",
    foreignKey: "id_menu_item",
  })
  public rel: HasMany<typeof MenuItemCpsc>;
}
