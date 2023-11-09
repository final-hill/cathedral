import layout from "layouts/BaseLayout.mjs";
import page from "lib/page.mjs";
import { EnvironmentRepository } from "data/EnvironmentRepository.mjs";
import pegsCards from "components/pegsCards.mjs";

const repo = new EnvironmentRepository()

page({ title: 'Environments' }, layout([
    pegsCards(repo)
]))