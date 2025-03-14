import { SystemComponent } from "#shared/domain"

export default putRequirementHttpHandler(
    SystemComponent.pick({
        reqType: true,
        name: true,
        description: true,
        parentComponent: true,
        isSilence: true
    }).partial().required({ reqType: true })
)