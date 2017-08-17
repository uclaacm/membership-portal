default: build run

dev: build run-dev

setup:
	if [ ! $(sudo docker volume ls | grep "postgres_data") ]; then \
		sudo docker volume create --name postgres_data; \
	fi
	if [ ! -f app/config/SESSION_SECRET ]; then \
		cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
	fi
	if [ ! -d pg_bkup ]; then \
		mkdir pg_bkup; \
	fi

certs:
	gpg certs.tar.gz.gpg
	tar -xvzf certs.tar.gz
	rm -rf certs.tar.gz

gen-certs:
	rm -rf certs-data
	mkdir -p certs-data
	sudo docker run -it --rm -v $(pwd)/certs:/etc/letsencrypt -v $(pwd)/certs-data:/data/letsencrypt deliverous/certbot certonly --webroot --webroot-path=/data/letsencrypt -d members.uclaacm.com

env:
	gpg node.env.gpg

gen-env:
	gpg -c node.env

update:
	git pull origin master
	git submodule update --init --recursive

build:
	sudo docker-compose build

run-dev:
	sudo docker-compose up

run:
	sudo docker-compose up -d

logs:
	sudo docker logs --follow $$(sudo docker ps | grep "nkansal/backend" | cut -d' ' -f1)

nginx-logs:
	sudo docker exec -it $$(sudo docker ps | grep "nkansal/static" | cut -d' ' -f1) tail -f /var/log/nginx/access.log

psql:
	sudo docker exec -it $$(sudo docker ps | grep "postgres" | cut -d' ' -f1) psql -U postgres

pg_bkup:
	sudo docker exec -it $$(sudo docker ps | grep "postgres" | cut -d' ' -f1) /bin/ash -c 'pg_dump -U postgres > "/backup/pg_bkup_$(shell date --iso-8601=minutes)"'

stop:
	sudo docker-compose down

reset: stop
	-sudo docker rm $$(sudo docker ps -aq)
	-sudo docker rmi nkansal/static
	-sudo docker rmi nkansal/backend
	-sudo docker volume rm postgres_data
	-sudo docker volume rm membershipportal_postgres_data

.PHONY: pg_bkup
