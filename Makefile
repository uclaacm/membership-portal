default: build run

dev: build run-dev

setup:
	cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET

build:
	docker-compose build

run-dev:
	docker-compose up

run:
	docker-compose up -d

logs:
	docker logs --follow $$(docker ps | grep "nkansal/membership" | cut -d' ' -f1)

stop:
	if [ $$(docker ps | grep "nkansal/membership" | cut -d' ' -f1) ]; then docker stop $$(docker ps | grep "nkansal/membership" | cut -d' ' -f1); fi
	if [ $$(docker ps | grep "postgres" | cut -d' ' -f1) ]; then docker stop $$(docker ps | grep "postgres" | cut -d' ' -f1); fi
	if [ $$(docker ps | grep "redis" | cut -d' ' -f1) ]; then docker stop $$(docker ps | grep "redis" | cut -d' ' -f1); fi

reset:
	-docker rm $$(docker ps -aq)
	-docker rmi nkansal/membership