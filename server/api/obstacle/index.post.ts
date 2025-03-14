import { Obstacle } from "#shared/domain"

export default postRequirementHttpHandler(
    Obstacle.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    })
)