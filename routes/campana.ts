import Route from "@ioc:Adonis/Core/Route";

Route.get("/campana/activas", "CampanasController.activas");
Route.get("/campana/activas/:idUsuario", "CampanasController.activas");

Route.post("/campana/nuevoRequerimiento", "CampanasController.mig_nuevoReq");
