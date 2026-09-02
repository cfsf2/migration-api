import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Pistas extends BaseSchema {
  protected tableName = "s_pista";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").unique().primary();
      table.integer("id_usuario").notNullable();
      table
        .foreign("id_usuario")
        .references("tbl_usuario.id")
        .onDelete("RESTRICT");
      table.integer("id_conf");
      table.foreign("id_conf").references("s_conf.id").onDelete("RESTRICT");
      table.text("values");

      table.timestamp("ts_creacion", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
