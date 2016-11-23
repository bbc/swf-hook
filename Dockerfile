FROM lambci/lambda:build-nodejs4.3

WORKDIR /var/task

COPY ./package.json ./package.json
RUN npm install

COPY ./lib ./lib
COPY ./tests ./tests
COPY ./.eslintrc.json ./.eslintrc.json
COPY *.js ./
COPY ./*.yaml ./
