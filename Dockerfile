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

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
RUN nvm install 20 
RUN nvm use 20
RUN nvm alias default 20

# Set the JAR path
ENV JAR_PATH=/usr/local/lib

# build frontend
COPY apps /opt/apps
WORKDIR /opt/apps/frontend
RUN npm install
RUN npm run build
RUN cp -r dist /opt/apps/backend/src/main/resources/static

WORKDIR /opt/apps/backend
RUN mvn clean package



# # apps/backend/hypertm/target/hypertm-0.0.1-SNAPSHOT.jar
# COPY apps/backend/hypertm/target/hypertm-0.0.1-SNAPSHOT.jar ${JAR_PATH}/hypertm.jar
# COPY bin/run.sh /usr/local/bin/run.sh

# RUN chmod +x /usr/local/bin/run.sh