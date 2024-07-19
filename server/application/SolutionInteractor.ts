import Solution from "~/server/domain/application/Solution";
import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";

export default class SolutionInteractor extends Interactor<Solution> {
    constructor(repository: Repository<Solution>) {
        super(repository, Solution)
    }
}