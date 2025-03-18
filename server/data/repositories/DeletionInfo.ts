import { AppUser } from "#shared/domain/application";
import { z } from "zod";

export type DeletionInfo = {
    deletedById: z.infer<typeof AppUser>['id'];
    deletedDate: Date;
};
