include .env

build:
	go build -o bin/hypertm .

run:
	@echo GOOGLE_APPLICATION_CREDENTIALS="$(shell pwd)/employee-data-mfw-e6ec68678768.json" ; 

	export AISEARCH_ENDPOINT="$(AISEARCH_ENDPOINT)" ; \
	export GOOGLE_CLOUD_PROJECT="$(GOOGLE_CLOUD_PROJECT)" ; \
	export GOOGLE_GENAI_USE_VERTEXAI="$(GOOGLE_GENAI_USE_VERTEXAI)" ; \
	export GOOGLE_APPLICATION_CREDENTIALS="$(shell pwd)/employee-data-mfw-e6ec68678768.json" ; \
	export GOOGLE_CLOUD_ENGINE="$(GOOGLE_CLOUD_ENGINE)" ; \
	go run ./main.go