import { SystemComponent } from "#shared/domain"

export default putRequirementHttpHandler(
    SystemComponent.pick({
        reqType: true,
        reqId: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        parentComponent: true
    }).partial().required({ reqType: true, reqIdPrefix: true })
)