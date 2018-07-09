.PHONY: clean build docker_build all release

# docker namespace
export DOCKER_ORG := expediadotcom
export DOCKER_IMAGE_NAME := haystack-ui

clean:
	npm -q run clean

install:
	npm -q install

build: clean install
	npm -q run build

docker_build:
	docker build -t $(DOCKER_IMAGE_NAME) -f build/docker/Dockerfile .

all: build docker_build

# build all and release
release: all
	./build/docker/publish-to-docker-hub.sh
