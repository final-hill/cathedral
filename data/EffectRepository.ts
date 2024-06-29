import PGLiteEntityRepository from "~/data/PGLiteEntityRepository";
import Effect from "../domain/Effect";

export default class EffectRepository extends PGLiteEntityRepository<Effect> {
    constructor() { super('cathedral.effect', Effect) }
}