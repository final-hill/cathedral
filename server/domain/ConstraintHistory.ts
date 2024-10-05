import { Entity } from '@mikro-orm/core';
import { Constraint } from './index.js';

/**
 * The history of a Constraint
 */
@Entity()
class ConstraintHistory extends Constraint { }

export { ConstraintHistory };