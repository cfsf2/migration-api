import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Laboratorio from 'App/Models/Laboratorio'

export default class LaboratoriosController {
    public async mig_index(){
        return await Laboratorio.traerLaboratorios();
    }
}
