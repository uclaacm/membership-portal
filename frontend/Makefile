APP_NAME=membership-portal-ui
ECR_URL=527059199351.dkr.ecr.us-west-1.amazonaws.com

all: build-static

ecr-login:
	$(shell aws ecr get-login --no-include-email --region us-west-1)

dev:
	WEBPACK=true npm run build-dev

build-static:
	NODE_ENV=production npm run build

build:
	docker build -t $(APP_NAME) .

push: ecr-login build
	docker tag $(APP_NAME):latest $(ECR_URL)/$(APP_NAME):latest
	docker push $(ECR_URL)/$(APP_NAME):latest
