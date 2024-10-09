import { Entity } from "@mikro-orm/core";
import { Example } from "./Example.js";

/**
 * A TestCase is a specification of the inputs, execution conditions,
 * testing procedure, and expected results that define a single test to
 * be executed to achieve a particular goal.,
 */
@Entity()
export class TestCase extends Example { }