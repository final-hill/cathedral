import { Glossary } from '~/domain/Glossary'
import { BaseStore } from './BaseStore'

export const GlossaryStore = BaseStore('glossaries', Glossary)