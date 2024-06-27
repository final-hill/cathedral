import Obstacle from "../domain/Obstacle";
import PGLiteRepository from "~/data/PGLiteRepository";

export default class ObstacleRepository extends PGLiteRepository<Obstacle> {
    constructor() { super('cathedral.obstacle', Obstacle) }
}