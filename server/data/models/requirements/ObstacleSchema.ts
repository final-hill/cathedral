import { EntitySchema } from "@mikro-orm/core";
import { Goal, Obstacle, ReqType } from '../../../../domain/requirements/index.js';

export const ObstacleSchema = new EntitySchema<Obstacle, Goal>({
    class: Obstacle,
    discriminatorValue: ReqType.OBSTACLE
})