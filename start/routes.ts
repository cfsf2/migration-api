import Route from '@ioc:Adonis/Core/Route'


import '../routes/usuario';


Route.get('/', async () => {
  return { hello: 'world' }
})
