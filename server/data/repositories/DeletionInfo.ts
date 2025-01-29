import { AppUser } from "~/domain/application";


export type DeletionInfo = {
    deletedById: AppUser['id'];
    deletedDate: Date;
};
