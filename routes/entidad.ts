import Route from "@ioc:Adonis/Core/Route";

Route.get("/entidades", "EntidadController.index");
Route.get("/entidades/entidadesAdmin", "EntidadController.index");

Route.post("/entidades","EntidadController.mig_agregar_entidad")
