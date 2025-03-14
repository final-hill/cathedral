import { Obstacle } from "#shared/domain"

export default findRequirementsHttpHandler(
    Obstacle.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)