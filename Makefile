APP_NAME=membership-portal
ECR_URL=527059199351.dkr.ecr.us-west-1.amazonaws.com

default: build
	docker compose --profile dev up

test: build
	docker compose --profile test up --abort-on-container-exit

ecr-login:
	$(shell aws ecr get-login --no-include-email --region us-west-1)

setup:
	if [ ! -f app/config/SESSION_SECRET ]; then \
		cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
	fi

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
