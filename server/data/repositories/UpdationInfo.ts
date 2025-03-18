import { AppUser } from "#shared/domain/application";
import { z } from "zod";

export type UpdationInfo = {
    modifiedById: z.infer<typeof AppUser>['id'];
    modifiedDate: Date;
};
