'use strict';

const { RpcServer } = require('sofa-rpc-node').server;
const logger = console;

const server = new RpcServer({
  logger,
  port: 12200,
});

server.addService({
  interfaceName: 'com.nodejs.test.TestService',
}, {
  async plus(a, b) {
    return a + b;
  },
});

server.start();
