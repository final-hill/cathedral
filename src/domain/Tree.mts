import { Entity } from './index.mjs';

export interface Tree extends Entity {
    children: this[];
}