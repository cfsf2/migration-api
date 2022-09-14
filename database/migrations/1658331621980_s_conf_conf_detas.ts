import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class SConfConfDetas extends BaseSchema {
  protected tableName = "s_conf_conf_deta";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("id_conf_conf_usuario")
        .references("s_conf_conf_usuario.id")
        .notNullable()
        .unsigned();
      table.integer("id_conf").references("s_conf.id").notNullable();
      table.integer("orden");
      table.enum("mostrar", ["s", "n"]);
      table.string("default", 256);
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table
        .integer("id_usuario_creacion")
        .references("tbl_usuario.id")
        .notNullable();
      table
        .integer("id_usuario_modificacion")
        .references("tbl_usuario.id")
        .notNullable();
      table.timestamp("ts_creacion", { useTz: true });
      table.timestamp("ts_modificacion", { useTz: true });
    });

    this.schema.alterTable(this.tableName, (table) => {
      table.index(
        ["id_conf_conf_usuario", "id_conf"],
        "id_conf_conf_usuario_id_conf_UNIQUE",
        "UNIQUE"
      );
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
