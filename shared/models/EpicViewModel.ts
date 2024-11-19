import type { FunctionalBehaviorViewModel } from "./FunctionalBehaviorViewModel";
import type { OutcomeViewModel } from "./OutcomeViewModel";
import type { StakeholderViewModel } from "./StakeholderViewModel";

export interface EpicViewModel {
    id: string;
    reqId: string;
    name: string;
    primaryActor: StakeholderViewModel;
    functionalBehavior: FunctionalBehaviorViewModel;
    outcome: OutcomeViewModel;
    lastModified: Date;
}