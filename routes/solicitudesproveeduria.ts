import Route from "@ioc:Adonis/Core/Route";

Route.get("/solicitudesproveeduria", "SolicitudesProveeduriaController.mig_index")

Route.get("/solicitudesproveeduria/farmacia/:id_farmacia", "SolicitudesProveeduriaController.mig_solicitud_farmacia")

Route.post("/solicitudesproveeduria", "SolicitudesProveeduriaController.mig_agregar_solicitud")