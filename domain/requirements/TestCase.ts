import { Entity } from "@mikro-orm/core";
import { Example } from "./Example.js";
import { ReqType } from "./ReqType.js";
import { type Properties } from "../types/index.js";

/**
 * A TestCase is a specification of the inputs, execution conditions,
 * testing procedure, and expected results that define a single test to
 * be executed to achieve a particular goal.,
 */
@Entity({ discriminatorValue: ReqType.TEST_CASE })
export class TestCase extends Example {
    constructor(props: Properties<Omit<TestCase, 'id' | 'req_type'>>) {
        super(props)
        this.req_type = ReqType.TEST_CASE
    }
}