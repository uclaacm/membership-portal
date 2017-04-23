default: build run

dev: build run-dev

setup:
	if [ ! $(docker volume ls | grep "postgres_data") ]; then \
		docker volume create postgres_data; \
	fi
	if [ ! -f app/config/SESSION_SECRET ]; then \
		cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
	fi

build:
	docker-compose build

run-dev:
	docker-compose up

run:
	docker-compose up -d

logs:
	docker logs --follow $$(docker ps | grep "nkansal/backend" | cut -d' ' -f1)

stop:
	if [ $$(docker ps | grep "nkansal/static") ]; then docker stop $$(docker ps | grep "nkansal/static" | cut -d' ' -f1); fi
	if [ $$(docker ps | grep "nkansal/backend") ]; then docker stop $$(docker ps | grep "nkansal/backend" | cut -d' ' -f1); fi
	if [ $$(docker ps | grep "postgres") ]; then docker stop $$(docker ps | grep "postgres" | cut -d' ' -f1); fi
	if [ $$(docker ps | grep "redis") ]; then docker stop $$(docker ps | grep "redis" | cut -d' ' -f1); fi

reset: stop
	-docker rm $$(docker ps -aq)
	-docker rmi nkansal/static
	-docker rmi nkansal/backend
	-docker volume rm postgres_data
	-docker volume rm membershipportal_postgres_data