import { app } from './app'
import { environment } from './env'

app
  .listen({
    port: environment.PORT,
  })
  .then((address) => {
    console.log(`server listening on ${address}`)
  })
