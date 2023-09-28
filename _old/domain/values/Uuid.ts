/*!
 * @license
 * Copyright (C) 2022 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

// This method is not yet in the TypeScript lib file (v4.4.3)
declare global {
    interface Crypto {
        randomUUID: () => string;
    }
}

export class Uuid {
    private _value: string;

    constructor(value: string = self.crypto.randomUUID()) {
        const reUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!reUuid.test(value)) { throw new TypeError('Invalid UUID format'); }

        this._value = value;
    }

    equals(other: Uuid): boolean { return other._value === this._value; }

    toString() { return `{${this._value}}`; }
}