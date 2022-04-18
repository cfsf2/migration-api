import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drogueria from 'App/Models/Drogueria'

export default class DrogueriasController {
    public async mig_index({ request }: HttpContextContract){
        return await Drogueria.traerDroguerias({ habilitado: 'true' })
    }

    public async mig_admin({ request }: HttpContextContract){
        return await Drogueria.traerDroguerias({})
    }
}
