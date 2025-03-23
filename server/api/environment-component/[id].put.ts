import { EnvironmentComponent } from "#shared/domain"

export default putRequirementHttpHandler(
    EnvironmentComponent.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        parentComponent: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)