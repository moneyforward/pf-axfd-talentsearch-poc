TYPESPEC_BUILD_DIR := tsp-output
OPENAPI_OUTPUT := $(TYPESPEC_BUILD_DIR)/openapi
SCHEMA_OUTPUT := $(TYPESPEC_BUILD_DIR)/json-schema

.PHONY: help install build clean watch format lint serve

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install
	go mod download

build: ## Compile TypeSpec to OpenAPI and JSON Schema
	npm run build
	@echo "Generated files:"
	@echo "  OpenAPI: $(OPENAPI_OUTPUT)/"
	@echo "  JSON Schema: $(SCHEMA_OUTPUT)/"

clean: ## Clean generated output
	npm run clean

watch: ## Watch for changes and rebuild automatically
	npm run watch

format: ## Format TypeSpec files
	npm run format

lint: ## Lint TypeSpec files
	npm run lint

serve: build ## Build and serve OpenAPI documentation
	@if command -v swagger-ui-serve >/dev/null 2>&1; then \
		swagger-ui-serve $(OPENAPI_OUTPUT)/openapi.yaml; \
	elif command -v redoc-cli >/dev/null 2>&1; then \
		redoc-cli serve $(OPENAPI_OUTPUT)/openapi.yaml; \
	else \
		echo "No OpenAPI documentation server found. Install swagger-ui-serve or redoc-cli:"; \
		echo "  npm install -g swagger-ui-serve"; \
		echo "  npm install -g redoc-cli"; \
	fi

validate: build ## Validate generated OpenAPI specification
	@if command -v swagger-codegen >/dev/null 2>&1; then \
		swagger-codegen validate -i $(OPENAPI_OUTPUT)/openapi.yaml; \
	elif command -v openapi-generator >/dev/null 2>&1; then \
		openapi-generator validate -i $(OPENAPI_OUTPUT)/openapi.yaml; \
	else \
		echo "No OpenAPI validator found. Install one of:"; \
		echo "  swagger-codegen: https://swagger.io/tools/swagger-codegen/"; \
		echo "  openapi-generator: https://openapi-generator.tech/"; \
	fi

check: lint validate ## Run all checks (lint + validate)

all: clean install build validate ## Clean, install, build, and validate
