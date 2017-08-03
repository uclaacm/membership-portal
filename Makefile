default: build run

dev: build run-dev

setup:
	if [ ! $(sudo docker volume ls | grep "postgres_data") ]; then \
		sudo docker volume create --name postgres_data; \
	fi
	if [ ! -f app/config/SESSION_SECRET ]; then \
		cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
	fi

update-static:
	git submodule update --init --recursive

build:
	sudo docker-compose build

run-dev:
	sudo docker-compose up

run:
	sudo docker-compose up -d

logs:
	sudo docker logs --follow $$(sudo docker ps | grep "nkansal/backend" | cut -d' ' -f1)

stop:
	if [ $$(sudo docker ps | grep "nkansal/static") ]; then sudo docker stop $$(sudo docker ps | grep "nkansal/static" | cut -d' ' -f1); fi
	if [ $$(sudo docker ps | grep "nkansal/backend") ]; then sudo docker stop $$(sudo docker ps | grep "nkansal/backend" | cut -d' ' -f1); fi
	if [ $$(sudo docker ps | grep "postgres") ]; then sudo docker stop $$(sudo docker ps | grep "postgres" | cut -d' ' -f1); fi
	if [ $$(sudo docker ps | grep "redis") ]; then sudo docker stop $$(sudo docker ps | grep "redis" | cut -d' ' -f1); fi

reset: stop
	-sudo docker rm $$(sudo docker ps -aq)
	-sudo docker rmi nkansal/static
	-sudo docker rmi nkansal/backend
	-sudo docker volume rm postgres_data
	-sudo docker volume rm membershipportal_postgres_data
