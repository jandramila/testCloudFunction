# DEV COMMANDS

# Start in development mode
start-dev:
	docker-compose up --build

start-dev-force-rebuild:
	docker-compose up --build --force-recreate

# Enter into the container with a bash console attached to the application
run-bash-dev:
	docker-compose exec prodsheet-feed bash

# PROD (local) COMMANDS

# Start in "production" mode
start:
	docker-compose -f docker-compose.yml up

# Starts the sender job. This starts the cron
run-job-cron:
	./scripts/run-jobs.sh

# SERVER COMMANDS (must be logged in to heroku with access to the project)

server-start-bash:
	heroku run bash --app armbrust-usa-prodsheet-feed

server-get-error-logs:
	heroku ps:copy error.log --app armbrust-usa-prodsheet-feed

server-get-info-logs:
	heroku ps:copy low-severity.log --app armbrust-usa-prodsheet-feed