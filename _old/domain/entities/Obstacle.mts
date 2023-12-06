import Goal from './Goal.mjs';

export default class Obstacle extends Goal {
    override get isRelevant() { return true; }
}