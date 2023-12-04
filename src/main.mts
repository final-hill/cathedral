/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import './presentation/default.css';
import './presentation/robots.txt';
import Application from './presentation/Application.mjs';

document.body.append(new Application());