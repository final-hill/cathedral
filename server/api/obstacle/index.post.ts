import { Obstacle } from "#shared/domain"

export default postRequirementHttpHandler(
    Obstacle.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true
    })
)