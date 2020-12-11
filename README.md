# Project status

### Dependencies and enviroment

#### Dependencies

- [Axios](https://github.com/axios/axios): For executing network requests
- [Dotenv](https://github.com/motdotla/dotenv): To manage the configuration
- [Eslint](https://eslint.org/) and [Prettier](https://prettier.io/): To enforce code styles
- [Nodemon](https://nodemon.io/): In order to improve development experience by reloading on every save
- [Moment](https://momentjs.com/): for managing dates easily
- [Winston](https://github.com/winstonjs): for logging errors and other information easily
- [Docker](https://www.docker.com/): For local development and managing the enviroment.

#### Versions

- **Node**: 14.7

### Run

### Makefile

Most of the actions needed have a corresponding command in the [Makefile][./makefile]. Just run `make {command}` to run it.

Commands are divided between dev and prod comments

#### NPM scripts available:

- `npm start` to run in production mode
- `npm run start-dev` to run in development mode.
- `npm run start-jobs` to start the sender job
- `npm run lint` to run the linter

#### Using plain Docker

- `docker-compose up` to run in development mode.
- `docker-compose -f docker-compose.yml up` to run in production mode

### Commands

- **`npm run lint`**: to run the linter (ESLint)
- **`npm run start-dev`:** to run the application in dev mode. This uses nodemon to improve user experience
- **`npm start`:** to start the application in prod mode

## How to develop locally

#### 1 - Local configuration

- Be sure to have all the enviroment variables setup (`.env` file created)
- Run the application, either using docker or locally
- Run [ngrok](https://ngrok.com/). This will allow create an ssh tunnel to your computer, giving you and https address to use to connect to your computer

#### 2 - Slack configuration

- Head over to Slack, and go to the application configuration
- Under `Features/Interactivity & shortcuts/Interactivity`, configure the app
  - Interactivity should be ON
  - The url should be `${https url that ngrok gave you}/interactions`
- On Slack you can find the auth token used for communication. This should be set in the .env file
  - You can find it under `Features/OAuth & permissions`

## Configuration

### Configuration file

#### Structure

The configuration file is what defines plenty of the behaviour of the application:

**questionary**

This is a list of the questions that will be asked. Each question has the following properties

- id: unique identifier that's used to identify the question. Please add a unique, kebab-cased, descriptive one
- question: The user-facing question that will be show
- type: The type of the question. "yes/no" or "text" field
- goodAnswer: The answer that's considered "good" (does not "trigger" a meeting). Please only write "yes" or "no", even changing the casing is a problem (only for yes/no questions).
- optional: If false the question is required.

#### How to update it

Just open a PR with the [JSON file](./jobs/Configuration.js) updated

### Enviroment variables

Copy the `.env.example` file into a `.env`. The values needed are:

**SLACK_AUTH_TOKEN:**

Token used to authenticate with slack for making requests to their API. This is obtained in the app configuration (Settings -> Install App -> OAuth Access Token). Remember to **never** commit this token to the repository.

**SLACK_SIGNATURE:**

Found in the same place than SLACK_AUTH_TOKEN but on the left

**PRODUCTION_SPREADHSEET_ID and HAPPY_AT_AS_SPREADSHEET_ID:**

Found in the url of the google sheet. It's the identification id. Remember that the google service account MUST be added as a collaborator, as if it was a normal personal account

**GOOGLE_SERVICE_ACCOUNT_EMAIL** and **GOOGLE_PRIVATE_KEY:**

This are the identifications for the "user" that will access the sheet and write to it. You can check [the docs](https://cloud.google.com/iam/docs/creating-managing-service-accounts) or [this video that shows step by step](https://www.youtube.com/watch?v=UGN6EUi4Yio&t=347s).

**GOOGLE_PRIVATE_KEY**

If you have any problems setting the key on heroku, check [the documentation](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account) for detailed instructions on how to do it

**HAPPY_EMAILS**

This is string that represents the JSON of the list of users that the "Happy at AS" questionary will be sent to.

Consists of:

- username: The name of the person. **Important:** this is used to identify the user in slack, so it should be the exactly user's slack name
- email: The email of the user. **Important:** this is used to identify the user in slack, so it should be the exactly user's slack email
- partner: The name of the partner

Example:

```js
[
  {
    name: 'name1',
    email: 'email1@email.co',
    partner: 'partner3',
  },
  {
    name: 'name2',
    email: 'email2@email.co',
    partner: 'partner2',
  },
  {
    name: 'name3',
    email: 'email3@email.co',
    partner: 'partner3',
  },
];
```

**PROJECT_STATUS_EMAILS**

For project status survey, users are activated with their corresponding configuration in **Configuration** tab inside Copilot spreadsheet.

## Logs

Logs are logged into the `error.log` file. Low severity information is logged into the `low-severity.log` file.

## Common tasks

You'll need the following to run this commands in the server:

- [heroku cli](https://devcenter.heroku.com/articles/heroku-cli) installed
- logged in
- permissions to the heroku project

#### Copy logs from the server

```
make server-get-error-logs
make server-get-info-logs
```

Run `heroku ps:copy ${log-file} --app ${app-name}`

[More info](https://devcenter.heroku.com/articles/heroku-cli-commands#heroku-ps-copy-file)

#### Get into the server

```
make server-start-bash
```

This runs `heroku run bash --app ${app-name}`. This will open a bash terminal with everything set up

#### Get into a specific server

Run `heroku ps:exec --dyno={dyno_name_goes_here}`. This will connect to a specific dyno that's running. **Warning:** env variables will not be set here. This is used to debug dyno performance, etc. If env variables are important, use bash

#### Test Project Status jobs in development env

To run specific jobs for Copilot bot you can comment the other jobs in "/scripts/run-jobs-dev.sh" and then run "make run-job-dev".

## Improvements/Roadmap

### Features/tasks

- Better monitoring on possible errors
  - A better viewer than just having a log file
  - Alerts
- Easily run 1-off tasks
  - For example, send the questionary to 1 person by a parameter (email)
- Debugging
  - Add debugging capabilities
- Add tests for some specific behaviours, like:
  - Creating the questionary from the configuration
- Better way to update the configuration
  - Small script that valides the configuration
    - Could be a CI step before merging
  - Config panel (long-term)

### Nice to haves

- Add typescript
