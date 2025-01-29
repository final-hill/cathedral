import { AppUser } from "~/domain/application";


export type UpdationInfo = {
    modifiedById: AppUser['id'];
    modifiedDate: Date;
};
