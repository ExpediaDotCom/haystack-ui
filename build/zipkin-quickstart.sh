#!/usr/bin/env bash

main() {
    local WORKSPACE=./zipkin-test

    # execution directory 
    mkdir $WORKSPACE
    cd $WORKSPACE

    # start sleuth
    printf 'downloading sleuth webmvc example ------\n'
    git clone https://github.com/openzipkin/sleuth-webmvc-example.git
    cd ./sleuth-webmvc-example

    # run backend
    printf 'running sleuth webmvc backend ------\n'
    mvn compile exec:java -Dexec.mainClass=sleuth.webmvc.Backend &
    SLEUTH_BACKEND_PROC_ID=$!
    printf 'backend proc id %s' "${SLEUTH_BACKEND_PROC_ID}\n"

    # run frontend
    printf 'running sleuth webmvc frontend ------\n'
    mvn compile exec:java -Dexec.mainClass=sleuth.webmvc.Frontend &
    SLEUTH_FRONTEND_PROC_ID=$!
    printf 'frontend proc id %s' "${SLEUTH_FRONTEND_PROC_ID} ------\n"

    # download and run zipkin
    printf 'downloading and running zipkin ------\n\r'
    curl -sSL https://zipkin.io/quickstart.sh | bash -s
    java -jar zipkin.jar &
    ZIPKIN_PROC_ID=$!
    printf 'frontend proc id %s' "${SLEUTH_FRONTEND_PROC_ID} ------\n"

    # run haystack ui
    cd ../../
    npm start
    printf 'started'


    # teardown services 
    printf 'tearing down ------\n'
    kill $SLEUTH_BACKEND_PROC_ID
    kill $SLEUTH_FRONTEND_PROC_ID
    kill $ZIPKIN_PROC_ID
}

main "$@"
