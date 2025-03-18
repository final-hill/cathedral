import { Obstacle } from "#shared/domain"

export default putRequirementHttpHandler(
    Obstacle.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)