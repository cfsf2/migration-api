import Route from "@ioc:Adonis/Core/Route";

Route.get("/campana/", "CampanasController.todas");
Route.get("/campana/activas", "CampanasController.activas");
Route.get("/campana/activas/:idUsuario", "CampanasController.activas");
Route.get("/campana/requerimientos", "CampanasController.mig_requerimientos");

Route.post("/campana/nuevoRequerimiento", "CampanasController.mig_nuevoReq");

Route.put(
  "/campana/finalizarrequerimiento",
  "CampanasController.update_requerimiento"
);
