import { z } from "zod"
import StakeholderSchema from "./StakeholderSchema"
import SilenceSchema from "./SilenceSchema"
import AssumptionSchema from "./AssumptionSchema"
import ConstraintSchema from "./ConstraintSchema"
import EffectSchema from "./EffectSchema"
import EnvironmentComponentSchema from "./EnvironmentComponentSchema"
import FunctionalBehaviorSchema from "./FunctionalBehaviorSchema"
import GlossaryTermSchema from "./GlossaryTermSchema"
import InvariantSchema from "./InvariantSchema"
import JustificationSchema from "./JustificationSchema"
import LimitSchema from "./LimitSchema"
import NonFunctionalBehaviorSchema from "./NonFunctionalBehaviorSchema"
import ObstacleSchema from "./ObstacleSchema"
import OutcomeSchema from "./OutcomeSchema"
import PersonSchema from "./PersonSchema"
import SystemComponentSchema from "./SystemComponentSchema"
import UserStorySchema from "./UserStorySchema"
import UseCaseSchema from "./UseCaseSchema"

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