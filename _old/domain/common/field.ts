/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

/**
 * Converts a property into a "field"
 * A "field" is a 'private' property + getter/setter pair
 *
 * @param {Object} target - The target class
 * @param {PropertyKey} key - The key of the target class
 */
const field: PropertyDecorator = (target, key) => {
    if (Reflect.deleteProperty(target, key)) {
        // Create new property with getter and setter
        Object.defineProperty(target, key, {
            get() {
                return this[`_${String(key)}`];
            },
            set(newVal) {
                this[`_${String(key)}`] = newVal;
            },
            enumerable: true,
            configurable: true
        });
    }
};

export default field;