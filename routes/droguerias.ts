import Route from "@ioc:Adonis/Core/Route";

Route.get("/droguerias", "DrogueriasController.mig_index");
Route.get("/droguerias/admin", "DrogueriasController.mig_admin");

Route.post("/droguerias", "DrogueriasController.mig_add");

Route.put("/droguerias", "DrogueriasController.mig_update");
