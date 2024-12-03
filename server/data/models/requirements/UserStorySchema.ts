import { EntitySchema } from "@mikro-orm/core";
import { ReqType, Scenario, UserStory } from '../../../../domain/requirements/index.js';

export const UserStorySchema = new EntitySchema<UserStory, Scenario>({
    class: UserStory,
    discriminatorValue: ReqType.USER_STORY,
    properties: {
        functionalBehavior: { kind: 'm:1', entity: 'FunctionalBehavior' }
    }
})