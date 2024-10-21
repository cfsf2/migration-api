import Route from "@ioc:Adonis/Core/Route";

Route.get("/farmacias", "FarmaciasController.mig_index");
Route.get("/farmaciasPlenas", "FarmaciasController.farmacias_plenas");
Route.get("/farmacias/usuario/:usuario", "FarmaciasController.existeUsuario");
Route.get("/farmacias/:usuario", "FarmaciasController.mig_perfil");
Route.get("/farmacias/login/:usuario", "FarmaciasController.mig_perfil");
Route.get(
  "/farmacias/matricula/:matricula",
  "FarmaciasController.mig_matricula"
).where("matricula", {
  match: /^[0-9]+$/,
  cast: (matricula) => Number(matricula),
});

Route.get(
  "/farmacias/admin/:id",
  "FarmaciasController.mig_admin_farmacia"
).where("id", {
  match: /^[0-9]+$/,
  cast: (matricula) => Number(matricula),
});

Route.post(
  "/farmacias/admin/passwords",
  "FarmaciasController.mig_admin_passwords"
);

Route.post("/farmacias/servicios/", "FarmaciasController.servicios")
Route.post("/farmacias/presentacion/","FarmaciasController.presentar")

Route.post("/farmacias/register-try", "FarmaciasController.mig_mail");
Route.post("/farmacias", "FarmaciasController.mig_create");

Route.put("/farmacias", "FarmaciasController.mig_updatePerfil");
Route.put("/farmacias/admin/", "FarmaciasController.mig_admin_updatePerfil");

Route.get("/farmacias/debitos/:periodo/:cufe", "DebitosController.debitos");

Route.post("/farmacia/nro_cuenta", "FarmaciasController.nro_cuenta");

Route.post("/farmacia/localidades", "FarmaciasController.localidades");

Route.get("/farmacias/subirDebitos/:periodo", "DebitosController.subirDebitos");
Route.get("/farmacias/revisar-carpeta/:periodo", "DebitosController.revisarCarpeta");
Route.get("/farmacias/subir-digital/:periodo", "DebitosController.subirDigital");
Route.get("/farmacias/contarDebitos/:periodo", "DebitosController.contarDebitos");
Route.get("/farmacias/cargar-debitos-db/:periodo", "DebitosController.cargarDebitos");