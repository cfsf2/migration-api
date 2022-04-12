import Route from "@ioc:Adonis/Core/Route";

import "../routes/usuario";
import "../routes/farmacia";
import "../routes/publicidad";
import "../routes/categoria";
import "../routes/entidad";
import "../routes/productopack";
import "../routes/campana";
import "../routes/pedido";
import "../routes/imagenes";
import "../routes/denuncias";
import "../routes/instituciones";
import "../routes/entidad";

Route.get("/", async () => {
  return { hello: "world" };
});
