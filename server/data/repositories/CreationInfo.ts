import { AppUser } from "~/domain/application";

export type CreationInfo = {
    createdById: AppUser['id'];
    effectiveDate: Date;
};
