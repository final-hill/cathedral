import Interactor from "~/server/application/Interactor";
import Obstacle from "~/server/domain/requirements/Obstacle";
import Repository from "./Repository";

export default class ObstacleInteractor extends Interactor<Obstacle> {
    constructor(repository: Repository<Obstacle>) {
        super(repository, Obstacle)
    }
}