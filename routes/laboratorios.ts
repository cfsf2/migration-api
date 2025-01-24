import Route from "@ioc:Adonis/Core/Route";

//Route.get("/laboratorios", "LaboratoriosController.mig_index");
Route.get("/laboratorios", "LaboratoriosController.index");
Route.get("/laboratoriosFarmacia", "LaboratoriosController.indexFarmacia");
Route.get("/laboratorios_admin", "LaboratoriosController.index_admin");

//Route.get("/laboratorios/:id", "LaboratoriosController.mig_transfers");
Route.get("/laboratorios/:id", "LaboratoriosController.transfers");

Route.post("/laboratorios", "LaboratoriosController.mig_add");

Route.put("/laboratorios", "LaboratoriosController.mig_update");

Route.get("/laboratorio_des/:id", "LaboratoriosController.lab_des");
