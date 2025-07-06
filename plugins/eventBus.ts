import mitt from 'mitt'

export default defineNuxtPlugin(() => {
    const emitter = mitt()

    return {
        provide: {
            eventBus: {
                $on: emitter.on,
                $emit: emitter.emit
            }
        }
    }
})
