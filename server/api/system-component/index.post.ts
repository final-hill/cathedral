import { SystemComponent } from "#shared/domain"

export default postRequirementHttpHandler(
    SystemComponent.pick({
        reqType: true,
        name: true,
        description: true,
        parentComponent: true,
        isSilence: true
    })
)