import { Epic } from "#shared/domain"

export default findRequirementsHttpHandler(
    Epic.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)