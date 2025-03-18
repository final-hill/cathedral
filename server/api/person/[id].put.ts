import { Person } from "#shared/domain"

export default putRequirementHttpHandler(
    Person.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        email: true
    }).partial().required({ reqType: true })
)