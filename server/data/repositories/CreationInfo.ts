import { AppUser } from "#shared/domain/application";
import { z } from "zod";

export type CreationInfo = {
    createdById: z.infer<typeof AppUser>['id'];
    effectiveDate: Date;
};
