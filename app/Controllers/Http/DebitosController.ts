import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import DebitoFarmacia from "App/Models/Debitofarmacia";
import ftpClient from "ftp-client";
import fs from "fs";
import AWS from "aws-sdk";
import Env from "@ioc:Adonis/Core/Env";
import { Debitofarmacia } from "App/Helper/ModelIndex";

export default class DebitosController {
  public async debitos({ request, bouncer }: HttpContextContract) {
    try {
      await bouncer.authorize("AccesoRuta", Permiso.FARMACIA_DEBITOPAMI);

      const { cufe, periodo } = request.params();
      const debitos = await DebitoFarmacia.query()
        .where("usuario", cufe)
        .andWhere("periodo", periodo);
      return {
        statusCode: 200,
        body: debitos,
        message: debitos.length > 0 ? "Debitos" : "No se encontraron Debitos",
      };
    } catch (err) {
      throw new ExceptionHandler();
    }
  }

  public async subirDebitos(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    try {
      let localPathToList = process.cwd() + "/public/debitos/" + periodo;

      // Comprueba la carpeta destino
      if (!fs.existsSync(localPathToList)) {
        fs.mkdir(localPathToList, (err) => {
          if (err) console.log(err);
        });
      }

      let remotePath1 =
        "/col2dasfe/PAMI/" + periodo + "/01 102_colegio_de_santa_fe_2da.circ";
      let remotePath2 =
        "/col2dasfe/PAMI/" + periodo + "/02 102_colegio_de_santa_fe_2da.circ";

      let mensaje;

      // SOURCE FTP CONNECTION SETTINGS
      var srcFTP = {
        // host: "200.69.207.130",
        // user: "col2dasfeC",
        host: Env.get("DEBITOS_FTP_SERVER"), //"intercambio.observer.com.ar",
        user: Env.get("DEBITOS_FTP_USER"), //"col2dasfe",
        password: Env.get("DEBITOS_FTP_PASSWORD"), //"95wHKJ8a5c",
        port: 21,
        connTimeout: 60000,
        pasvTimeout: 60000,
      };

      const options = {
        logging: "basic",
      };

      const client = new ftpClient(srcFTP, options);

      client.connect(function () {
        client.download(
          remotePath1,
          localPathToList,
          {
            overwrite: "all",
          },
          function (result) {
            mensaje = result;
          }
        );
        client.download(
          remotePath2,
          localPathToList,
          {
            overwrite: "all",
          },
          function (result) {
            mensaje = result;
          }
        );
      });

      return ctx.response.send(mensaje);
    } catch (err) {
      console.log(err);
      throw new ExceptionHandler().handle(err, ctx);
    }
  }

  public async revisarCarpeta(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;
    let count = 0;

    const files = fs.readdirSync(localPathToList);

    count = (files as string[]) ? files.length : 0;

    return `Archivos subidos:  ${count}`;
  }

  public async subirDigital(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let userFolder = Env.get("S3_BUCKET") + "/debitos/" + periodo;

    const s3 = new AWS.S3({
      accessKeyId: Env.get("S3_KEY"),
      secretAccessKey: Env.get("S3_SECRET"),
      // Bucket: Env.get("S3_BUCKET"),
    });

    const uploadBucket = async (nombreArchivo) => {
      const stream = fs.createReadStream(localPathToList + "/" + nombreArchivo);
      var params = {
        Bucket: userFolder,
        Key: nombreArchivo,
        ACL: "public-read",
        Body: stream,
      };
      let subido = await s3.upload(params).promise();

      return subido;
    };

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;
    const files = fs.readdirSync(localPathToList);
    const total = files.length;
    let index = 0;
    for (index; index < files.length; index++) {
      await uploadBucket(files[index]);
    }
    return ctx.response.send(`Archivos subidos : ${index} de ${total}`);
  }

  public async contarDebitos(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let userFolder = "debitos/" + periodo;

    const s3 = new AWS.S3({
      accessKeyId: Env.get("S3_KEY"),
      secretAccessKey: Env.get("S3_SECRET"),
    });

    let count = 0;

    async function contarBucket(c?: string | undefined) {
      const listObjects = await s3
        .listObjectsV2({
          Bucket: Env.get("S3_BUCKET"),
          Prefix: userFolder,
          MaxKeys: 20000,
          StartAfter: c,
        })
        .promise();

      let files = listObjects.Contents ?? [];
      count += files.length;
      if (listObjects.IsTruncated) {
        await contarBucket(listObjects.Contents?.pop()?.Key);
      }
    }
    await contarBucket();

    return `Archivos en ${Env.get("S3_BUCKET") + "/" + userFolder} = ${count}`;
  }

  public async cargarDebitos(ctx: HttpContextContract) {
    const { request } = ctx;
    const periodo = request.params().periodo;

    if (!periodo)
      throw new ExceptionHandler().handle({ code: "FALTA_PERIODO" }, ctx);

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;

    // Busca los débitos de la Farmacia
    fs.readdir(localPathToList, async (err, files) => {
      if (err) {
        console.log(err);
      }
      for (let index = 0; index < files.length; index++) {
        let nombre = files[index];
        let archivo = nombre.split("_");
        let usuario = archivo[0];

        const debitoSearch = await Debitofarmacia.query().where(
          "archivo",
          files[index]
        );

        if (debitoSearch?.length == 0) {
          const debito = new Debitofarmacia();
          debito.merge({
            usuario,
            periodo,
            archivo: files[index],
          });
          await debito.save();
        }
      }
    });

    return `Se inicia la carga de debitos periodo ${periodo} en la Base Datos`;
  }
}
