import { SystemComponent } from "#shared/domain"

export default findRequirementsHttpHandler(
    SystemComponent.pick({
        reqType: true,
        name: true,
        description: true,
        parentComponent: true
    }).partial().required({ reqType: true })
)