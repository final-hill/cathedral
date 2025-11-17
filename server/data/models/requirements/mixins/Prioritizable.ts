import { Enum } from '@mikro-orm/core'
import { MoscowPriority } from '../../../../../shared/domain/requirements/enums.js'
import type { Constructor } from '../../../../../shared/types/index.js'

/**
 * Prioritizable mixin for ORM models that adds Moscow Priority functionality.
 *
 * @param base - The base class to mix prioritizable functionality into
 * @returns A new class that extends the base with priority property
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
export function Prioritizable<T extends Constructor<any>>(Base: T) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class PrioritizableClass extends (Base as new (...args: any[]) => any) {
        priority?: MoscowPriority
    }

    // Apply the decorator manually to the property
    Enum({ items: () => MoscowPriority, nullable: true })(PrioritizableClass.prototype, 'priority')

    return PrioritizableClass
}
