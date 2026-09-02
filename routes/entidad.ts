import Route from "@ioc:Adonis/Core/Route";

Route.get("/entidades", "EntidadController.index");
Route.get("/entidades/entidadesAdmin", "EntidadController.index");

Route.post("/entidades", "EntidadController.mig_agregar_entidad");

Route.put("/entidades", "EntidadController.mig_update_entidad");

Route.delete("/entidades/:id", "EntidadController.mig_delete");
