import { GlossaryTerm } from "#shared/domain"

export default postRequirementHttpHandler(
    GlossaryTerm.pick({
        reqType: true,
        name: true,
        description: true,
        parentComponent: true
    })
)