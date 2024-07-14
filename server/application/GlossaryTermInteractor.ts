import Interactor from "~/server/application/Interactor";
import GlossaryTerm from "~/server/domain/GlossaryTerm";
import Repository from "./Repository";

export default class GlossaryTermInteractor extends Interactor<GlossaryTerm> {
    constructor(repository: Repository<GlossaryTerm>) {
        super(repository, GlossaryTerm)
    }
}