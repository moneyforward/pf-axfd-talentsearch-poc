PROJECT_NAME=hypertm
VERSION=1.0.0



.PHONY:build
build: reactbuild javabuild
	@echo "Building the project..."
	@echo "build backend and frontend"
	make -C apps/backend build
	make -C apps/frontend build
	@echo "This is where the build commands would go."
	docker build -t $(PROJECT_NAME):$(VERSION) .
	@echo "Build complete."

.PHONY: run
run: build
	@echo "Running the project..."
	docker run --rm -p 8080:8080 $(PROJECT_NAME):$(VERSION)

.PHONY: shell
shell: build
	@echo "Starting a shell in the project container..."
	docker run --rm -it $(PROJECT_NAME):$(VERSION) /bin/bash

.PHONY: javabuild
javabuild:
	@echo "Building Java project..."
	@echo "This is where the Java build commands would go."
	@echo "Java build complete."


.PHONY: reactbuild
reactbuild:
	@echo "Building React project..."
	@echo "This is where the React build commands would go."
	@echo "React build complete."

.PHONY:clean
clean: 
	@echo "Cleaning the project..."
	@echo "This is where the clean commands would go."
	@echo "Clean complete."



