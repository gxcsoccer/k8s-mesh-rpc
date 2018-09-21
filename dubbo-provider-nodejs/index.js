'use strict';

const os = require('os');
const localIp = require('address').ip();
const protocol = require('dubbo-remoting');
const { RpcServer } = require('sofa-rpc-node').server;
const hostname = os.hostname();
const logger = console;

const server = new RpcServer({
  logger,
  port: 12345,
  protocol,
});

server.addService({
  interfaceName: 'com.alibaba.boot.dubbo.demo.DemoService',
  version: '1.0.1',
}, {
  async sayHello(name) {
    return `Hello, ${name} (from Nodejs dubbo e2e test) [${hostname}/${localIp}]`;
  },
});

server.start();
