import Route from "@ioc:Adonis/Core/Route";

Route.get("/transfers", "TransfersController.mig_index");

Route.post("/transfers", "TransfersController.mig_add");
