import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { boolaEnumObj, eliminarKeysVacios, enumaBool } from 'App/Helper/funciones';
import Laboratorio from 'App/Models/Laboratorio'

export default class LaboratoriosController {
    public async mig_index(){
        return await Laboratorio.traerLaboratorios();
    }

    public async mig_add({request}:HttpContextContract){
        const nuevoLab = new Laboratorio()
        delete request.body()._id
        nuevoLab.merge(eliminarKeysVacios(boolaEnumObj(request.body())))
        try{
            nuevoLab.save()
        }catch(err){
            console.log(err)
            return err
        }
        return
    }

    public async mig_update({request}:HttpContextContract){
        const lab = await Laboratorio.findOrFail(request.qs().id)
        delete request.body()._id
        lab.merge(eliminarKeysVacios(boolaEnumObj(request.body())))
        try{
            lab.save()
           return
        }catch(err){
            console.log(err)
            return err
        }
    }
}
