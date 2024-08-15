import { appRunner } from "../../slackAppRunner";

export default defineEventHandler(async (event) => {
    const { req, res } = event.node

    await appRunner.handleEvents(req, res)
})