import { Person } from "#shared/domain"

export default putRequirementHttpHandler(
    Person.pick({
        reqType: true,
        name: true,
        description: true,
        email: true,
        isSilence: true
    }).partial().required({ reqType: true })
)