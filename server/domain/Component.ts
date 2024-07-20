import Actor from "./Actor.js";

/**
 * Idenfitication of a part (of the Project, Environment, Goals, or System)
 */
export default abstract class Component extends Actor {
    abstract parentComponent?: Component
}
