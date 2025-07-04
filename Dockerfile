FROM ubuntu

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    wget

# Install SDKMAN!
RUN curl -s "https://get.sdkman.io" | bash
RUN bash -c "source $HOME/.sdkman/bin/sdkman-init.sh && sdk install java 21.0.7-ms && sdk install maven 3.9.9"

# Set the JAR path
ENV JAR_PATH=/usr/local/lib

# apps/backend/hypertm/target/hypertm-0.0.1-SNAPSHOT.jar
COPY apps/backend/hypertm/target/hypertm-0.0.1-SNAPSHOT.jar ${JAR_PATH}/hypertm.jar
COPY bin/run.sh /usr/local/bin/run.sh

RUN chmod +x /usr/local/bin/run.sh