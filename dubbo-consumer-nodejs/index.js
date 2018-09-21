'use strict';

const { RpcClient } = require('sofa-rpc-node').client;
const protocol = require('dubbo-remoting');
const logger = console;

async function invoke() {
  const client = new RpcClient({
    logger,
    protocol
  });
  const consumer = client.createConsumer({
    interfaceName: 'com.alibaba.boot.dubbo.demo.DemoService',
    version: '1.0.1',
    serverHost: '127.0.0.1:12345',
  });
  await consumer.ready();

  const result = await consumer.invoke('sayHello', ['zongyu'], { responseTimeout: 3000 });
  console.log('result', result);
}

invoke().catch(console.error);
