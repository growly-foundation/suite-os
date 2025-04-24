build-agent:
	cd packages/agent && docker buildx build --platform linux/amd64 -t growly-agent:amd64 .

build-server:
	cd packages/server && docker buildx build --platform linux/amd64 -t growly-server:amd64 .

push-server:
	docker tag growly-server:amd64 registry.digitalocean.com/growly/growly-server
	docker push registry.digitalocean.com/growly/growly-server

push-agent:
	docker tag growly-agent:amd64 registry.digitalocean.com/growly/growly-agent
	docker push registry.digitalocean.com/growly/growly-agent

up:
	docker compose -f docker-compose.yaml up -d