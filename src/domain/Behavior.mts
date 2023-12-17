import type { Properties } from '~/types/Properties.mjs';
import Requirement from './Requirement.mjs';

export default class Behavior extends Requirement {
    constructor(options: Properties<Behavior>) {
        super(options);
    }
}