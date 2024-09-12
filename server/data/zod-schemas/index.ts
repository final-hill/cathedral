import { z } from "zod"
import StakeholderSchema from "./StakeholderSchema"
import SilenceSchema from "./SilenceSchema"

export default z.object({
    requirements: z.array(z.union([
        StakeholderSchema,
        SilenceSchema
    ]))
})