import Mapper from '~/application/Mapper';
import Entity from '~/domain/Entity';
import SemVer, { type SemVerString } from '~/domain/SemVer';
import type { Uuid } from '~/domain/Uuid';

export interface EntityJson {
    id: Uuid;
    serializationVersion: SemVerString;
}

export default class EntityToJsonMapper extends Mapper<Entity, EntityJson> {
    /**
     * Converts the JSON representation of an entity to an entity.
     * @param target The JSON representation of the entity.
     * @returns The entity.
     */
    mapFrom(target: EntityJson): Entity {
        const version = new SemVer(target.serializationVersion);

        return new Entity({ id: target.id });
    }

    /**
    * Converts the entity to a JSON representation.
    * @param source The entity to convert.
    * @returns The JSON representation of the entity.
    */
    mapTo({ id }: Entity): EntityJson {
        return {
            serializationVersion: this.serializationVersion,
            id
        };
    }
}