import { type Entity } from '~/domain/index.mjs';

export default interface Presenter<E extends Entity> {
    presentItem(entity: E): void;
    presentList(entities: E[]): void;
}