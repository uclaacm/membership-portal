APP_NAME=membership-portal
ECR_URL=527059199351.dkr.ecr.us-west-1.amazonaws.com

default: build
	docker compose --profile dev up

# Unit + integration tests in Docker, against throwaway test databases (see docker-compose.yml).
# `run` starts only test-backend and the test databases it depends on (not the dev Postgres) and
# exits with the test result; the test databases are then removed whether the tests passed or not.
test: build
	docker compose --profile test run --rm test-backend; \
	status=$$?; \
	docker compose --profile test rm --stop --force -v test-postgres test-mongo; \
	exit $$status

ecr-login:
	$(shell aws ecr get-login --no-include-email --region us-west-1)

db-init:
	node scripts/db-init.js

migrate: db-init
	npx sequelize-cli db:migrate

rollback:
	npx sequelize-cli db:migrate:undo

setup:
	if [ ! -f app/config/SESSION_SECRET ]; then \
		cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
	fi
	$(MAKE) migrate

seed-internship-test-data:
	node scripts/seed-internship-test-data.js

seed-officer-test-applications:
	node scripts/seed-officer-test-applications.js

ash:
	docker run -v $(pwd):/app -p "8080:8080" $(APP_NAME) /bin/ash

build:
	docker-compose build
	touch build

run:
	docker run -p "8080:8080" $(APP_NAME)

push: ecr-login build
	docker tag $(APP_NAME):latest $(ECR_URL)/$(APP_NAME):deploy
	docker push $(ECR_URL)/$(APP_NAME):deploy
