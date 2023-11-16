import qr from "qrcode";
import { createCanvas, loadImage } from "canvas";
// import fs from "fs/promises";

export const generarQR = async (
  link: string,
  textoSuperior: string,
  textoInferior: string,
  logoPath?: string
) => {
  // Configuración del QR
  if (!logoPath) {
    logoPath = "./public/Logo-pointer.png";
  }
  const opcionesQR = {
    errorCorrectionLevel: "H",
    type: "image/png",
    rendererOpts: {
      quality: 0.3,
    },
  };

  // Generar el QR como un buffer
  const qrBuffer = await qr.toBuffer(link, opcionesQR);

  // Crear un lienzo (canvas) para la imagen final
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");

  // Agregar un marco negro
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Agregar texto superior
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(textoSuperior.toUpperCase(), canvas.width / 2, 40);

  // Cargar el QR en el centro
  const qrImage = await loadImage(qrBuffer);
  const qrX = (canvas.width - qrImage.width) / 2;
  const qrY = (canvas.height - qrImage.height) / 2;
  ctx.drawImage(qrImage, qrX, qrY);

  // Cargar la imagen del logo directamente en canvas con fondo
  const logo = await loadImage(logoPath);
  const logoWidth = qrImage.width * 0.15;
  const logoHeight = qrImage.height * 0.15;
  const logoX = (canvas.width - logoWidth) / 2;
  const logoY = (canvas.height - logoHeight) / 2;

  // Agregar un fondo al logo
  ctx.fillStyle = "#000000"; // color del fondo (blanco)
  ctx.fillRect(logoX - 6, logoY - 6, logoWidth + 11, logoHeight + 12);

  // Dibujar el logo en el fondo
  ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

  // Agregar texto inferior
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    textoInferior.toUpperCase(),
    canvas.width / 2,
    canvas.height - 20
  );

  // Guardar la imagen resultante
  // await fs.writeFile("imagenConQRyLogo.png", canvas.toBuffer());

  return canvas.toBuffer();
};

// Obtener los parámetros desde la línea de comandos
// const link = process.argv[2];
// const textoSuperior = process.argv[3] || "Texto Superior";
// const textoInferior = process.argv[4] || "Texto Inferior";
// const logoPath = process.argv[5] || "./Logo-pointer.png"; // Reemplaza con la ruta a tu logo

// // Verificar si se proporcionó un enlace
// if (!link) {
//   console.error("Por favor, proporciona un enlace como argumento.");
// } else {
//   // Llamar a la función con los enlaces y textos proporcionados
//   generarQR(link, textoSuperior, textoInferior, logoPath);
// }
