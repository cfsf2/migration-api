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

  @args.string()
  public descripcion: string;

  @args.string()
  public tipo: string;

  @args.spread()
  public permisos: string[];

  public async run() {
    const { default: Perfil } = await import("App/Models/Perfil");
    const { default: PerfilPermiso } = await import("App/Models/PerfilPermiso");

    const perfil = await Perfil.query()
      .where("nombre", this.perfilBase)
      .preload("permisos")
      .firstOrFail();

    if (!perfil) return this.logger.warning("Ese perfil no existe");

    const nuevoPerfil = await Perfil.create({
      nombre: this.nuevoPerfil,
      descripcion: this.descripcion,
      tipo: this.tipo,
    });

    perfil.permisos.map(async (permiso) => {
      return await PerfilPermiso.create({
        id_perfil: nuevoPerfil.id,
        id_permiso: permiso.id
      })
    });

    this.permisos.forEach(async(permiso) => //modelo de permiso )
    

    if (perfil) {
      this.logger.success("Perfil Existente");

      console.log(this.nuevoPerfil);
    }
  }
}
