import Interactor from "~/server/application/Interactor";
import Repository from "./Repository";
import EnvironmentComponent from "../domain/EnvironmentComponent";

export default class EnvironmentComponentInteractor extends Interactor<EnvironmentComponent> {
    constructor(repository: Repository<EnvironmentComponent>) {
        super(repository, EnvironmentComponent)
    }
}