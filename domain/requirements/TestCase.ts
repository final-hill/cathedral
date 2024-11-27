import { Entity } from "@mikro-orm/core";
import { Example } from "./Example.js";
import { ReqType } from "./ReqType.js";

/**
 * A TestCase is a specification of the inputs, execution conditions,
 * testing procedure, and expected results that define a single test to
 * be executed to achieve a particular goal.
 */
@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCase extends Example {
    static override req_type: ReqType = ReqType.TEST_CASE;
}