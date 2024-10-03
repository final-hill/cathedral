import { z } from "zod"
import StakeholderSchema from "./StakeholderSchema.js"
import SilenceSchema from "./SilenceSchema.js"
import AssumptionSchema from "./AssumptionSchema.js"
import ConstraintSchema from "./ConstraintSchema.js"
import EffectSchema from "./EffectSchema.js"
import EnvironmentComponentSchema from "./EnvironmentComponentSchema.js"
import FunctionalBehaviorSchema from "./FunctionalBehaviorSchema.js"
import GlossaryTermSchema from "./GlossaryTermSchema.js"
import InvariantSchema from "./InvariantSchema.js"
import JustificationSchema from "./JustificationSchema.js"
import LimitSchema from "./LimitSchema.js"
import NonFunctionalBehaviorSchema from "./NonFunctionalBehaviorSchema.js"
import ObstacleSchema from "./ObstacleSchema.js"
import OutcomeSchema from "./OutcomeSchema.js"
import PersonSchema from "./PersonSchema.js"
import SystemComponentSchema from "./SystemComponentSchema.js"
import UserStorySchema from "./UserStorySchema.js"
import UseCaseSchema from "./UseCaseSchema.js"

export default z.object({
    requirements: z.array(z.union([
        AssumptionSchema,
        ConstraintSchema,
        EffectSchema,
        EnvironmentComponentSchema,
        FunctionalBehaviorSchema,
        GlossaryTermSchema,
        InvariantSchema,
        JustificationSchema,
        LimitSchema,
        NonFunctionalBehaviorSchema,
        ObstacleSchema,
        OutcomeSchema,
        PersonSchema,
        StakeholderSchema,
        SystemComponentSchema,
        SilenceSchema,
        UserStorySchema,
        UseCaseSchema
    ]))
})