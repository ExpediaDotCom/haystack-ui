.PHONY: all integration_test release

DOCKER_IMAGE_TAG := haystack-ui
PWD := $(shell pwd)
SERVICE_DEBUG_ON ?= false

clean:
	npm run clean

build:  clean
	npm run build

docker_build:
	docker build -t $(DOCKER_IMAGE_TAG) -f build/docker/Dockerfile .

all: build docker_build

# build all and release
REPO := lib/haystack-ui
BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
VERSION := $(shell git rev-parse HEAD)
SHORT_VERSION := $(shell git rev-parse --short HEAD)
CURRENT_SYMENTIC_VERSION := $(shell git describe --abbrev=0 --tags)
ifeq ($(BRANCH), master)
release: all
	# assign latest tag
	docker tag $(DOCKER_IMAGE_TAG) $(REPO):latest
	# assign version tag
	docker tag $(DOCKER_IMAGE_TAG) $(REPO):$(VERSION)
	# assign symentic version tag
	docker tag $(DOCKER_IMAGE_TAG) $(REPO):$(CURRENT_SYMENTIC_VERSION).$(SHORT_VERSION)
	# push image
	docker push $(REPO)
else
release: all
endif
