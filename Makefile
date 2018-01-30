default: build run

dev: build run-dev

setup:
	if [ ! $(docker volume ls | grep "postgres_data") ]; then \
		docker volume create --name postgres_data; \
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

package-certs:
	tar -cvzf certs.tar.gz certs
	gpg -c certs.tar.gz
	rm -rf certs.tar.gz

renew-certs:
	rm -rf certs-data
	mkdir -p certs-data
	docker run \
		-v $(shell pwd)/certs:/etc/letsencrypt \
		-v $(shell pwd)/certs-data:/data/letsencrypt \
		-e domains="members.uclaacm.com" \
		-e email="acm@ucla.edu" \
		-p 80:80 -p 443:443 \
		--rm -t pierreprinetti/certbot:latest

env:
	gpg node.env.gpg

gen-env:
	gpg -c node.env

update:
	git pull origin master
	git submodule update --init --recursive

build:
	docker-compose build

run-dev:
	docker-compose up

run:
	docker-compose up -d

logs:
	docker logs --follow $$(docker ps | grep "nkansal/backend" | cut -d' ' -f1)

nginx-logs:
	docker exec -it $$(docker ps | grep "nkansal/static" | cut -d' ' -f1) tail -f /var/log/nginx/access.log

psql:
	docker exec -it $$(docker ps | grep "postgres" | cut -d' ' -f1) psql -U postgres

pg_bkup:
	docker exec -it $$(docker ps | grep "postgres" | cut -d' ' -f1) /bin/ash -c 'pg_dump -U postgres > "/backup/pg_bkup_$(shell date --iso-8601=minutes)"'

stop:
	docker-compose down

reset: stop
	-docker rm $$(docker ps -aq)
	-docker rmi nkansal/static
	-docker rmi nkansal/backend
	-docker volume rm postgres_data
	-docker volume rm membershipportal_postgres_data

.PHONY: pg_bkup certs
