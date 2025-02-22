import { getConnection } from "~/mikro-orm.config"

// ref: https://github.com/nuxt/nuxt/discussions/17103
export default eventHandler(async (event) => {
    const orm = await getConnection()
    Object.assign(event.context, {
        orm,
        em: orm.em.fork({ useContext: true })
    })
})