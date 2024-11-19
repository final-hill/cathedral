import { AppRole } from '~/domain/application/AppRole.js'

export interface AppUserViewModel {
    id: string;
    name: string
    email: string;
    role: AppRole;
    isSystemAdmin: boolean;
    creationDate: Date;
    lastLoginDate?: Date;
}