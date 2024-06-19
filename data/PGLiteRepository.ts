import Repository from '~/application/Repository';
import type Entity from '~/domain/Entity';
import { PGliteWorker } from "@electric-sql/pglite/worker";

export default abstract class PGLiteRepository<E extends Entity> extends Repository<E> {
    private static _db = new PGliteWorker('idb://cathedral');
}