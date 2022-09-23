import Route from "@ioc:Adonis/Core/Route";

//Route.get("/laboratorios", "LaboratoriosController.mig_index");

Route.get("/laboratorios", "LaboratoriosController.index");
//Route.get("/laboratorios/:id", "LaboratoriosController.mig_transfers");

Route.get("/laboratorios/:id", "LaboratoriosController.transfers");

Route.post("/laboratorios", "LaboratoriosController.mig_add");

Route.put("/laboratorios", "LaboratoriosController.mig_update");
