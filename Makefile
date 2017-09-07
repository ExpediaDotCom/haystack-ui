.PHONY: clean build docker_build all release

# docker namespace
DOCKER_ORG := expediadotcom
DOCKER_IMAGE_NAME := haystack-ui

# branching and versioning
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
VERSION := $(shell git rev-parse HEAD)
SHORT_VERSION := $(shell git rev-parse --short HEAD)
CURRENT_SYMENTIC_VERSION := $(shell git describe --abbrev=0 --tags)

clean:
	npm run clean

build:  clean
	npm run build

docker_build:
	docker build -t $(DOCKER_IMAGE_NAME) -f build/docker/Dockerfile .

all: build docker_build

# build all and release
ifeq ($(BRANCH), master)
release: all
	# assign latest tag
	docker tag $(DOCKER_IMAGE_NAME) $(DOCKER_ORG)/$(DOCKER_IMAGE_NAME):latest
	# assign version tag
	docker tag $(DOCKER_IMAGE_NAME) $(DOCKER_ORG)/$(DOCKER_IMAGE_NAME):$(VERSION)
	# assign symentic version tag
	# docker tag $(DOCKER_IMAGE_NAME) $(DOCKER_ORG)/$(DOCKER_IMAGE_NAME):$(CURRENT_SYMENTIC_VERSION).$(SHORT_VERSION)
	# push image
	docker push $(DOCKER_ORG)/$(DOCKER_IMAGE_NAME)
else
release: all
endif
