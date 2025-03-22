import { Situation } from "#shared/domain"

export default findRequirementsHttpHandler(
    Situation.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)
