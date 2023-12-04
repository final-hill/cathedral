/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Container } from '~components/index.mjs';

export default class Page extends Container {
    protected override _initStyle() {
        return {
            ...super._initStyle(),
            'h1': {
                fontSize: '2em',
                marginTop: '0',
            },
            'h2': {
                marginTop: '0',
            },
            'a': {
                color: 'var(--link-color)',
                textDecoration: 'none'
            },
            'a:hover, a:active, a:focus': {
                textDecoration: 'underline'
            }
        };
    }

    override get title() {
        return document.title;
    }
    override set title(value: string) {
        document.title = value;
        super.title = value;
    }
}