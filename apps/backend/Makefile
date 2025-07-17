include .env

build:
	go build -o bin/hypertm .

run:
	export AISEARCH_ENDPOINT="$(AISEARCH_ENDPOINT)"; go run ./main.go