import { Epic } from "#shared/domain"

export default findRequirementsHttpHandler(
    Epic.pick({
        reqType: true,
        name: true,
        description: true
    }).partial().required({ reqType: true })
)