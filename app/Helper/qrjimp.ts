import Jimp from "jimp";
import { toDataURL } from "qrcode";

async function generarQR(texto, textoSuperior, textoInferior, logo?: string) {
  if (!logo) {
    logo = "./Logo-pointer.png";
  }
  // Generar el código QR
  const qrDataUrl = await toDataURL(texto, { scale: 5, margin: 2 });

  // Cargar el código QR con Jimp
  const qrImage = await Jimp.read(
    Buffer.from(qrDataUrl.split(",")[1], "base64")
  );

  // Crear una nueva imagen con el ancho y alto aumentados por el marco negro
  const marcoX = qrImage.bitmap.width < 50 ? 50 : 0.3 * qrImage.bitmap.width;
  const marcoY = qrImage.bitmap.height < 50 ? 50 : 0.3 * qrImage.bitmap.height;

  const canvas = new Jimp(
    qrImage.bitmap.width + 2 * marcoX, // Ancho del marco: 2 * 50px
    qrImage.bitmap.height + 2 * marcoY, // Alto del marco: 2 * 50px
    0x000000ff // Color negro para el fondo
  );
  const canvasHeight = canvas.getHeight();

  // Pegar el QR en el centro del lienzo
  const qrX = Math.floor((canvas.bitmap.width - qrImage.bitmap.width) / 2);
  const qrY = Math.floor((canvas.bitmap.height - qrImage.bitmap.height) / 2);
  canvas.composite(qrImage, qrX, qrY);

  // Agregar texto superior
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const texts = textoSuperior.toUpperCase();
  const textWidth = Jimp.measureText(font, texts);
  const textX = Math.floor((canvas.bitmap.width - textWidth) / 2);
  canvas.print(font, textX, 0.08 * canvasHeight, texts);

  // Agregar texto inferior
  const texti = textoInferior.toUpperCase();
  const textWidthInferior = Jimp.measureText(font, texti);
  const textXInferior = Math.floor(
    (canvas.bitmap.width - textWidthInferior) / 2
  );
  canvas.print(
    font,
    textXInferior,
    canvas.bitmap.height - 0.15 * canvasHeight,
    texti
  );

  // Cargar el logo y redimensionarlo
  const logoImage = await Jimp.read(logo);
  const logoWidth = canvas.bitmap.width * 0.1; // 10% del ancho
  const logoHeight = canvas.bitmap.height * 0.1; // 10% del alto

  // Crear un fondo negro para el logo con un margen de 5px
  const logoWithBackground = new Jimp(
    logoWidth + 5,
    logoHeight + 5,
    0x000000ff
  );

  // Pegar el logo en el centro del fondo negro
  const logoX = Math.floor((logoWithBackground.bitmap.width - logoWidth) / 2);
  const logoY = Math.floor((logoWithBackground.bitmap.height - logoHeight) / 2);
  logoWithBackground.composite(
    logoImage.resize(logoWidth, logoHeight),
    logoX,
    logoY
  );

  // Pegar el logo con fondo negro en el centro del lienzo
  const logoXCanvas = Math.floor(
    (canvas.bitmap.width - logoWithBackground.bitmap.width) / 2
  );
  const logoYCanvas = Math.floor(
    (canvas.bitmap.height - logoWithBackground.bitmap.height) / 2
  );
  canvas.composite(logoWithBackground, logoXCanvas, logoYCanvas);
  return await canvas.getBufferAsync(Jimp.MIME_PNG);
  // Guardar la imagen resultante
  canvas.write("resultado.png");
}

export default generarQR;

// Uso de la función
// generarQR(
//   "https://www.loquedicemilei.com",
//   "./Logo-pointer.png",
//   "Texto superior",
//   "Texto inferw45ryior"
// );
