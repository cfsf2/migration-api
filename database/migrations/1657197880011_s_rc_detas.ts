import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class SRcDetas extends BaseSchema {
  protected tableName = "s_rc_deta";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").notNullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("ts_creacion", { useTz: true });
      table.integer("id_rc").notNullable().unsigned();
      table
        .foreign("id_rc")
        .references("s_rc.id")
        .onDelete("RESTRICT")
        .onUpdate("RESTRICT");
      table.string("campo", 100).notNullable();
      table.string("valor", 100).notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
