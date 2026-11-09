APP_NAME=membership-portal-ui
ECR_URL=527059199351.dkr.ecr.us-west-1.amazonaws.com

default:
	docker-compose build
	docker-compose up

ecr-login:
	$(shell aws ecr get-login --no-include-email --region us-west-1)

build:
	docker build -t $(APP_NAME) .

push: ecr-login build
	docker tag $(APP_NAME):latest $(ECR_URL)/$(APP_NAME):deploy
	docker push $(ECR_URL)/$(APP_NAME):deploy
