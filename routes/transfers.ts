import Route from "@ioc:Adonis/Core/Route";

Route.get("/transfers", "TransfersController.mig_index");

Route.get("/transfers/farmacia/:id", "TransfersController.mig_byFarmacia");

//Route.post("/transfers", "TransfersController.mig_add");

Route.post("/transfers", "TransfersController.add");
