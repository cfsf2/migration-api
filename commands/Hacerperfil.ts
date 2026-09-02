import { args, BaseCommand } from "@adonisjs/core/build/standalone";

export default class Hacerperfil extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "hacerperfil";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "";

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  @args.string()
  public perfilBase: string;

  @args.string()
  public nuevoPerfil: string;

  @args.spread()
  public permisos: string[];

  public async run() {
    const { default: Perfil } = await import("App/Models/Perfil");
    const { default: PerfilPermiso } = await import("App/Models/PerfilPermiso");
    const { default: Permiso } = await import("App/Models/Permiso");

    const perfil = await Perfil.query()
      .where("nombre", this.perfilBase)
      .preload("permisos")
      .first();

    if (!perfil) return this.logger.warning("Ese perfil no existe");

    if (perfil) {
      this.logger.info("Ingresa los datos del perfil");

      const nuevoPerfil = await Perfil.create({
        nombre: this.nuevoPerfil,
        descripcion: await this.prompt.ask("Descripcion de perfil: "),
        tipo: await this.prompt.choice("Select account type", [
          {
            name: "admin",
            message: "Admin (Complete access)",
          },
          {
            name: "farmacia",
            message: "Farmacia (Can access specific resources)",
          },
        ]),
      });

      await Promise.all(
        perfil.permisos.map(async (permiso) => {
          return await PerfilPermiso.create({
            id_perfil: nuevoPerfil.id,
            id_permiso: permiso.id,
          });
        })
      );

      await Promise.all(
        this.permisos.map(async (permiso) => {
          const existeP = await Permiso.query()
            .where("nombre", permiso)
            .first();

          if (!existeP) {
            this.logger.warning("El permiso no existe");
            this.logger.info("Ingresa los datos del nuevo permiso");

            const nuevoPermiso = await Permiso.create({
              nombre: permiso,
              descripcion: await this.prompt.ask("Descripcion del permiso: "),
              tipo: await this.prompt.ask("Tipo/permiso: "),
            });

            await PerfilPermiso.create({
              id_perfil: nuevoPerfil.id,
              id_permiso: nuevoPermiso.id,
            });
            return this.logger.success("Permiso creado!");
          }

          return await PerfilPermiso.create({
            id_perfil: nuevoPerfil.id,
            id_permiso: existeP.id,
          });
        })
      );
      return this.logger.success("Perfil creado!");
    }
  }
}
