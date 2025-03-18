import { Person } from "#shared/domain"

export default postRequirementHttpHandler(
    Person.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        email: true
    })
)