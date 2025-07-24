include .env

build:
	go build -o bin/hypertm .

run:
	export AISEARCH_ENDPOINT="$(AISEARCH_ENDPOINT)" ; \
	export AISEARCH_API_KEY="$(gcloud auth print-access-token )" ; \
	export GOOGLE_CLOUD_PROJECT="$(GOOGLE_CLOUD_PROJECT)" ; \
	export GOOGLE_GENAI_USE_VERTEXAI="$(GOOGLE_GENAI_USE_VERTEXAI)" ; \
	go run ./main.go