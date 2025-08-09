// eslint-disable-next-line no-unused-vars
// @ts-nocheck
import WasmWorker from './worker?worker';

export class WorkerAPI {
  constructor(options = {}) {
    this.nextResponseId = 0;
    this.responseCBs = new Map();
    this.worker = new WasmWorker();
    const channel = new MessageChannel();
    this.port = channel.port1;
    this.port.onmessage = this.onmessage.bind(this);

    const remotePort = channel.port2;
    this.worker.postMessage({ id: "constructor", data: remotePort }, [
      remotePort,
    ]);
    this.options = options;
  }

  terminate() {
    this.worker.terminate();
  }

  async runAsync(id, options) {
    const responseId = this.nextResponseId++;
    const responsePromise = new Promise((resolve, reject) => {
      this.responseCBs.set(responseId, { resolve, reject });
    });
    this.port.postMessage({ id, responseId, data: options });
    return await responsePromise;
  }

  async compileToAssembly(options) {
    return this.runAsync("compileToAssembly", options);
  }

  compileLinkRun(contents) {
    this.port.postMessage({ id: "compileLinkRun", data: contents });
  }

  onmessage(event) {
    switch (event.data.id) {
      case "write":
        if(this.options.onWrite) {
          this.options.onWrite(event);
        } 
        break;

      case "runAsync": {
        const responseId = event.data.responseId;
        const promise = this.responseCBs.get(responseId);
        if (promise) {
          this.responseCBs.delete(responseId);
          promise.resolve(event.data.data);
        }
        break;
      }
    }
  }
}
