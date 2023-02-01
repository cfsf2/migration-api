import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ExceptionHandler from "App/Exceptions/Handler";
import { Permiso } from "App/Helper/permisos";
import DebitoFarmacia from "App/Models/Debitofarmacia";
import ftpClient from "ftp-client";
import fs from "fs";

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

      let remotePath1 =
        "/col2dasfe/PAMI/" + periodo + "/01 102_colegio_de_santa_fe_2da.circ";
      let remotePath2 =
        "/col2dasfe/PAMI/" + periodo + "/02 102_colegio_de_santa_fe_2da.circ";

      let mensaje;

      // Comprueba la carpeta destino

      if (!fs.existsSync(localPathToList)) {
        fs.mkdir(localPathToList, (err) => {});
      }

      // SOURCE FTP CONNECTION SETTINGS
      var srcFTP = {
        host: "200.69.207.130",
        user: "col2dasfeC",
        password: "Hg83722$e",
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

      return mensaje;
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

    fs.readdir(localPathToList, async (err, files) => {
      let count = typeof files === "undefined" ? 0 : files.length;
      return "Archivos subidos: " + count;
    });
  }
}

//// DEBITOS PAMI

router.get(
  "/revisar-carpeta/:periodo",
  //validar de otra forma
  async function (req, res, next) {
    //FARMACIA_DEBITOPAMI
    if (!req.params.periodo) {
      res.json(util.getErrorMsg({ message: "Falta periodo" }));
    }
    let periodo = req.params.periodo;
    let localPathToList = process.cwd() + "/public/debitos/" + periodo;
    console.log(localPathToList);
    fs.readdir(localPathToList, async (err, files) => {
      let count = typeof files === "undefined" ? 0 : files.length;
      res.json(util.getSuccessMsg({ msg: "Archivos subidos : " + count }));
    });
  }
);

router.get(
  "/subir-digital/:periodo",
  //validar de otra forma
  async function (req, res, next) {
    //FARMACIA_DEBITOPAMI
    if (!req.params.periodo) {
      res.json(util.getErrorMsg({ message: "Falta periodo" }));
    }
    let periodo = req.params.periodo;
    let userFolder = config.BUCKET_NAME + "/debitos/" + periodo;

    const s3 = new AWS.S3({
      accessKeyId: config.S3_KEY,
      secretAccessKey: config.S3_SECRET,
      Bucket: userFolder,
    });

    const uploadBucket = (nombreArchivo) => {
      const stream = fs.createReadStream(localPathToList + "/" + nombreArchivo);
      var params = {
        Bucket: userFolder,
        Key: nombreArchivo,
        ACL: "public-read",
        Body: stream,
      };
      let subido = s3.upload(params).promise();
      return subido;
    };

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;

    fs.readdir(localPathToList, async (err, files) => {
      for (let index = 0; index < files.length; index++) {
        uploadBucket(files[index]);
      }

      res.json(
        util.getSuccessMsg({ msg: "Archivos subidos : " + files.length })
      );
    });
  }
);

router.get(
  "/cargar-debitos-db/:periodo",
  //validar de otra forma
  async function (req, res, next) {
    //FARMACIA_DEBITOPAMI
    if (!req.params.periodo) {
      res.json(util.getErrorMsg({ message: "Falta periodo" }));
    }

    let periodo = req.params.periodo;

    let localPathToList = process.cwd() + "/public/debitos/" + periodo;

    // Busca los débitos de la Farmacia
    fs.readdir(localPathToList, async (err, files) => {
      for (let index = 0; index < files.length; index++) {
        let nombre = files[index];
        let archivo = nombre.split("_");
        let usuario = archivo[0];

        let query = { archivo: files[index] };

        const debitoSearch = await debitoFarmacia.find(query);

        if (debitoSearch.length == 0) {
          const debito = new debitoFarmacia({
            usuario,
            periodo,
            archivo: files[index],
          });
          await debito.save();
        }
      }
    });

    res.json(
      util.getSuccessMsg({
        message: `Se inicia la carga de debitos periodo ${periodo} en la Base Datos`,
      })
    );
  }
);
router.get(
  "/debitos/:periodo/:usuario",
  [validarToken, getPermisos, checkPermiso("FARMACIA_DEBITOPAMI")],
  async function (req, res, next) {
    //FARMACIA_DEBITOPAMI
    let periodo = req.params.periodo;
    let usuario = req.params.usuario;

    let query = {
      usuario,
      periodo,
    };

    const debitoSearch = await debitoFarmacia.find(query);

    return debitoSearch.length > 0
      ? res.json(util.getSuccessMsg(debitoSearch))
      : res.json(util.getErrorMsg({ message: "Debito no encontrado" }));
  }
);
