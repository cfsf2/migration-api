import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class SErrorMysqls extends BaseSchema {
  protected tableName = "s_error_mysql";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("error_mysql", 100).unique().notNullable();
      table.string("detalle", 250).notNullable();
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("ts_creacion", { useTz: true });
      table.timestamp("ts_modificacion", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
