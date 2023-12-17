import Entity from '~/domain/Entity.mjs';
import type { Uuid } from '~/types/Uuid.mjs';
import Mapper from '~/usecases/Mapper.mjs';

export interface EntityJson {
    id: Uuid;
    serializationVersion: string;
}

export default class EntityToJsonMapper extends Mapper<Entity, EntityJson> {
    /**
     * Converts the JSON representation of an entity to an entity.
     * @param target The JSON representation of the entity.
     * @returns The entity.
     */
    mapFrom(target: EntityJson): Entity {
        const version = target.serializationVersion ?? '{undefined}';

        if (version.startsWith('0.3.'))
            return new Entity(target);

        throw new Error(`Unsupported serialization version: ${version}`);
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