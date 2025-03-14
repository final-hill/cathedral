import { GlossaryTerm } from "~/shared/domain"

export default putRequirementHttpHandler(
    GlossaryTerm.pick({
        reqType: true,
        name: true,
        description: true,
        isSilence: true
    }).partial().required({ reqType: true })
)