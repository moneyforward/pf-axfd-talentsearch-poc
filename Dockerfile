FROM ubuntu
SHELL ["/bin/bash", "-c"]
ENV HOME="/root"

RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    zip \
    wget 

RUN git clone https://github.com/go-nv/goenv.git ${HOME}/.goenv
# Go Build Environment
ENV GOENV_ROOT="${HOME}/.goenv"
ENV PATH="${GOENV_ROOT}/bin:$PATH"
RUN echo 'eval "$(goenv init -)"' >> ${HOME}/.bashrc


# Node.js Build Environment
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# RUN export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" ;\
#     [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm 
ENV NVM_DIR=${HOME}/.nvm

COPY apps /usr/local/apps
WORKDIR /usr/local/apps/frontend
RUN source ${NVM_DIR}/nvm.sh && nvm install 20 && nvm use 20 && nvm alias default 20 && \
    rm -rf package-lock.json node_modules dist && npm install && npm run build
RUN mkdir -p /opt/local/frontend/dist && \
    mkdir -p /opt/local/backend
RUN cp -r /usr/local/apps/frontend/dist /opt/local/frontend/



WORKDIR /usr/local/apps/backend
RUN goenv install latest && \
    goenv global latest
RUN eval "$(goenv init -)" && \
    go mod tidy && \
    go build  .

RUN cp /usr/local/apps/backend/pf-skillsearch /opt/local/backend/pf-skillsearch

WORKDIR /opt/local/backend
CMD [ "./pf-skillsearch" ]
EXPOSE 8080
