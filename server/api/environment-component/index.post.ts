import { EnvironmentComponent } from "#shared/domain"

export default postRequirementHttpHandler(
    EnvironmentComponent.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        parentComponent: true
    })
)