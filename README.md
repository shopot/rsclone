# Card Game Durak (RS Clone 2022Q3)

## Description

Team project by [@shopot](https://github.com/shopot), [@sinastya](https://github.com/sinastya/), and [@gentoosiast](https://github.com/gentoosiast/)

#### VS Code Extensions required for development

- [EditorConfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Stylelint](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)

#### Full-Stack Projects

- [Node.js](https://nodejs.org)
- [React](https://reactjs.org)
- [React Router](https://reactrouter.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Phaser](https://phaser.io/)
- [Nest.js](http://nodejs.org/)
- [TypeORM](https://typeorm.io/)
- [SQLite](https://www.sqlite.org)

## Installation

- Clone this repository on your local computer
- Install depends npm packages of Node.js for client and server

```bash
$ git clone https://github.com/shopot/rsclone.git
$ cd rsclone
$ git checkout develop
$ git pull
$ cd client
$ npm install
$ cd ../server
$ npm install
```

## Running the back-end

- configure .env as needed for production mode

```bash
# inside rsclone directory
$ cd ./server

# development and watch mode
$ npm run start:dev

# production mode
$ cp .env-example .env
# modify .env as needed
$ npm run start:prod
```

## Running the app

- configure .env as needed for production mode

```bash
# inside rsclone directory
$ cd ./client

# development and watch mode
$ npm run start

# production
$ cp .env.development .env.production
# modify .env.production as needed
$ npm run build
```

Card Game Durak is now ready! You can access it via `http://localhost:3000`.
