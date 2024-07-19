import Interactor from "~/server/application/Interactor";
import Effect from "~/server/domain/requirements/Effect";
import Repository from "./Repository";

export default class EffectInteractor extends Interactor<Effect> {
    constructor(repository: Repository<Effect>) {
        super(repository, Effect)
    }
}