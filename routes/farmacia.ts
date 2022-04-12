import Route from "@ioc:Adonis/Core/Route";

Route.get("/farmacias", "FarmaciasController.ts.mig_index");
Route.get(
  "/farmacias/usuario/:usuario",
  "FarmaciasController.ts.existeUsuario"
);
Route.get("/farmacias/:usuario", "FarmaciasController.ts.mig_perfil");
Route.get("/farmacias/login/:usuario", "FarmaciasController.ts.mig_perfil");
Route.get(
  "/farmacias/matricula/:matricula",
  "FarmaciasController.ts.mig_matricula"
);
Route.get("/farmacias/admin/:id", "FarmaciasController.ts.mig_admin_farmacia");

Route.post(
  "/farmacias/admin/passwords",
  "FarmaciasController.ts.mig_admin_passwords"
);

Route.post("/farmacias/register-try", "FarmaciasController.ts.mig_mail");
Route.post("/farmacias", "FarmaciasController.ts.mig_create");

Route.put("/farmacias", "FarmaciasController.ts.mig_updatePerfil");
Route.put("farmacias/admin/", "FarmaciasController.ts.mig_admin_updatePerfil");
