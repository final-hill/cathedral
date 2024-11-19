import type { MoscowPriority } from "~/domain/requirements";

export type UseCaseViewModel = {
    id: string;
    reqId: string;
    name: string;
    priority: MoscowPriority;
    scope: string;
    level: string;
    primaryActor: string;
    outcome: string;
    precondition: string;
    triggerId: string;
    mainSuccessScenario: string;
    successGuarantee: string;
    extensions: string;
    lastModified: Date;
};