import type { ReqType } from '~/server/data/models/requirements/ReqType.js';

export interface RequirementViewModel {
    id: number;
    name: string;
    description: string;
    lastModified: Date;
    modifiedBy: { name: string };
    follows: RequirementViewModel[];
    solution: { id: number };
    req_type: ReqType;
    isSilence: boolean;
}