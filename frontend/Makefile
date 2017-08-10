all: build

build:
	NODE_ENV=production npm run build

dev:
	WEBPACK=true npm run build-dev

gen: build
	mkdir -p public
	mkdir -p public/build
	cp -r pages/* public
	cp lib/build/main.css public/build
	cp lib/build/main.js public/build
