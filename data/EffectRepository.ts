import PGLiteRepository from "~/data/PGLiteRepository";
import Effect from "../domain/Effect";

export default class EffectRepository extends PGLiteRepository<Effect> {
    constructor() { super('cathedral.effect', Effect) }
}