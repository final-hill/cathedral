import { Obstacle } from "#shared/domain"

export default findRequirementsHttpHandler(
    Obstacle.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)