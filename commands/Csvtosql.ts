import { BaseCommand } from "@adonisjs/core/build/standalone";

import fs from "fs";
import csv from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import Farmacia from "App/Models/Farmacia";

export default class Csvtosql extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "csvtosql";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "";

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  public async run() {
    // Función para generar el SQL de inserción
    async function generateInsertSQL(
      row: any,
      id_farmacia: number | null
    ): Promise<string> {
      return (
        `INSERT INTO tbl_evento_participante (id_evento, id_farmacia, titular, nombre, matricula, documento, telefono, token, pagado) ` +
        `VALUES (1, ${id_farmacia}, '${row.Apellido}', '${row.Nombre}', '${
          row.Matricula
        }', '${row.DNI}', '${row.Celular}', '${uuidv4()}','s');`
      );
    }

    // Función principal para leer el CSV y generar los inserts
    async function generateSQLFromCSV(csvFile: string, outputFile: string) {
      const outputStream = fs.createWriteStream(outputFile, {
        flags: 'w',
        encoding: 'utf8',
      })

      const rows: any[] = []
      
      return new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvFile)
          .pipe(csv({ separator: ';' }))
          .on('data', (row: any) => rows.push(row))
          .on('error', (error) => {
            console.error(`Error al leer el archivo CSV: ${error.message}`)
            reject(error)
          })
          .on('end', async () => {
            console.log(`Se han leído ${rows.length} filas. Procesando...`)
            
            for (const row of rows) {
              try {
                const farmacia = await Farmacia.query()
                  .where('matricula', row.Matricula)
                  .first()

                const id_farmacia = farmacia ? farmacia.id : null
                const sql = await generateInsertSQL(row, id_farmacia)
                outputStream.write(sql + '\n')
              } catch (error) {
                console.error(
                  `Error al procesar la fila con matrícula "${row.Matricula}": ${
                    error instanceof Error ? error.message : 'Error desconocido'
                  }`
                )
              }
            }
            
            console.log(`Archivo ${outputFile} generado exitosamente.`)
            outputStream.end()
            resolve()
          })
      })
    }

    // Archivos CSV de entrada y salida
    const csvFile = "data.csv";
    const outputFile = "inserts.sql";

    // Iniciar la generación del archivo
    try {
      await generateSQLFromCSV(csvFile, outputFile);
      console.log("Proceso completado correctamente.");
    } catch (error) {
      console.error(
        "Error en la generación del archivo SQL:",
        error instanceof Error ? error.message : error
      );
    }
  }
}
