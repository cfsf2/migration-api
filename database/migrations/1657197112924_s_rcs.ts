import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class SRcs extends BaseSchema {
  protected tableName = "s_rc";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").notNullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("ts_creacion", { useTz: true });
      table.integer("id_usuario").notNullable();
      table
        .foreign("id_usuario")
        .references("tbl_usuario.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
      table.string("tabla", 100).notNullable();
      table.integer("id_registro").notNullable().unsigned();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
