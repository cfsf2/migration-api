import Route from "@ioc:Adonis/Core/Route";

Route.get("/repooss", "RepoosController.index");
Route.post("/repooss", "RepoosController.update");
