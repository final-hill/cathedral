import Obstacle from "../domain/Obstacle";
import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";

export default class ObstacleRepository extends PGLiteEntityRepository<Obstacle> {
    constructor() { super('cathedral.obstacle', Obstacle) }
}