import { GlossaryTerm } from "#shared/domain"

export default postRequirementHttpHandler(
    GlossaryTerm.pick({
        reqType: true,
        reqIdPrefix: true,
        name: true,
        description: true,
        parentComponent: true
    })
)