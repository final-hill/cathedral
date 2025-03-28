import { Person } from "#shared/domain"

export default findRequirementsHttpHandler(
    Person.pick({
        reqType: true,
        name: true,
        description: true,
        email: true
    }).partial().required({ reqType: true })
)