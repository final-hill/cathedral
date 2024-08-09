## Getting Started

### Prerequisites

- [VS Code](https://code.visualstudio.com/)
  - `choco install vscode`
- WSL2
  - [WSL2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - `choco install docker-desktop`
- [pgAdmin](https://www.pgadmin.org/)
  - `choco install pgadmin4`

## Project Setup

1. Start Docker Desktop.
2. Open the project in VS Code.
3. The project should automatically detect the `.devcontainer` folder and ask you to reopen the project in a container. Before doing so, Copy the `.env.example` file to `.env` and fill in the necessary values.
4. Reopen the project in the dev container. (You can also do this by clicking on the blue button in the bottom left corner of the window.)
5. The project will now start downloading the necessary dependencies and setting up the environment.
  1. Docker images
  2. Node modules
  3. VS Code extensions

## Database population

There are a number of commands defined in `package.json` that can be run to populate the database with data:

1. `npm run orm-create-db`
2. `npm run orm-run-pending-migrations`
3. `npm run orm-seed-users`
4. `npm run orm-seed-roles`

## Running the project

The project can be run in debug mode via: `npm run dev`. You can then access the application at `https://localhost:3000`.

A production build can be run via: `npm run build` followed by `npm run preview`. You can then access the application at `https://localhost:3000`.

## Application Infrastructure

The application is built using the following primary technologies:

- [Nuxt.js](https://nuxtjs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [PrimeVue](https://primevue.org/)
  - [PrimeFlex](https://primeflex.org/)
  - [Zod](https://zod.dev/)
- [@azure/msal-node](https://www.npmjs.com/package/@azure/msal-node)
- [Node.js](http://nodejs.org/)
- [MikroORM](https://mikro-orm.io/)
- [PostgreSQL](https://www.postgresql.org/)

## Application Architecture

The application is a monolith following a layers architecture. The application is split into the following layers:

### Server

- domain
   - Entities & Value Objects
- data
   - models (used by MikroORM)
- api
   - This is currently blending the application and infrastructure layers. This will be refactored in the future by separating the application and infrastructure layers.

### Client

- pages
- components
- layouts

## CI/CD Notes

The Infrastructure is managed by Azure Bicep. The CI/CD pipeline is managed by GitHub Actions.
Communication between GitHub and Azure is managed by OpenID Connect.

- [Configuration details](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-github-actions?tabs=CLI%2Copenid)
  - [Supporting details](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure?tabs=azure-cli%2Cwindows#use-the-azure-login-action-with-openid-connect)
- [GitHub Environment details](https://docs.github.com/en/actions/administering-github-actions/managing-environments-for-deployment)

## Troubleshooting

Most issues can be resolved by restarting the dev container. This can be done by closinng and reopening VSCode. Don't do this too quickly. When VSCode is closed, the Docker containers take some time to stop.

If you are still having issues, try deleting the containers and images and restarting the dev container.

If you run into issues related to npm install hanging ([Known bug](https://github.com/npm/cli/issues/4028)). You can try running `npm install` on each dependency individually. For example: `npm install @mikro-orm/core`, `npm install nuxt`, etc. This is a worst case scenario and seems to surface intermittently. The bug is potentially related to IPV6.