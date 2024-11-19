import { ConstraintCategory } from '~/domain/requirements/ConstraintCategory.js';

export interface ConstraintViewModel {
    id: string;
    reqId: string;
    name: string;
    description: string;
    category: ConstraintCategory;
    lastModified: Date;
}