import Route from "@ioc:Adonis/Core/Route";

import "../routes/usuario";
import "../routes/farmacia";

Route.get("/", async () => {
  return { hello: "world" };
});
