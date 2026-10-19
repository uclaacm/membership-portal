default: deploy

setup:
	if [ ! -d pg_bkup ]; then \
		mkdir pg_bkup; \
	fi

logs:
	docker logs --follow $$(docker ps | grep "backend" | cut -d' ' -f1)

nginx-logs:
	docker exec -it $$(docker ps | grep "static" | cut -d' ' -f1) tail -f /var/log/nginx/access.log

psql:
	docker exec -it $$(docker ps | grep "postgres" | cut -d' ' -f1) psql -U postgres

pg_bkup:
	db_id=$$(docker ps -q --filter "name=postgres"); \
	timestamp=$$(date -u +%Y-%m-%dT%H-%M-%SZ); \
	docker exec "$$db_id" /bin/ash -c "pg_dump -U postgres > /backup/pg_bkup_$$timestamp"

stop:
	docker compose down

# Secrets are not kept in git. node.env lives only on the server (and with the
# officers who need it); the SSH key is expected at ~/.ssh/id_rsa_acm_west.
SSH_KEY ?= $(HOME)/.ssh/id_rsa_acm_west

# Compose interpolates GOOGLE_* (UI build args) and MONGO_* (mongodb service)
# from the shell, not from env_file, so they have to be exported.
COMPOSE_ENV = export $$(grep -E '^(GOOGLE|MONGO)_' node.env | xargs)

ssh:
	ssh uclaacm@gateway.uclaacm.com -p 5905 -i $(SSH_KEY)

run:
	$(COMPOSE_ENV) && docker compose up -d --build

deploy:
	git checkout main
	git pull
	$(COMPOSE_ENV) && docker compose up -d --build

remote-deploy:
	ssh uclaacm@gateway.uclaacm.com -p 5905 -i $(SSH_KEY) "cd membership-portal/deployment/prod && make deploy"

.PHONY: pg_bkup
