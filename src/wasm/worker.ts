// eslint-disable-next-line no-unused-vars
// @ts-nocheck
import { API } from './shared';
import { getWasmUrl } from "../utils/wasm-loader";


interface WorkerMessage {
  id: string;
  data?: any;
  responseId?: string;
}

interface APIOptions {
  readBuffer: (filename: string) => Promise<ArrayBuffer>;
  compileStreaming: (filename: string) => Promise<WebAssembly.Module>;
  hostWrite: (s: string) => void;
}

let api: API;
let port: MessagePort;
let currentApp: any = null;

const apiOptions: APIOptions = {
  async readBuffer(filename) {
    const wasmUrl = getWasmUrl(filename);
    console.log('Loading file:', wasmUrl);
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return response.arrayBuffer();
  },

  async compileStreaming(filename) {
    const wasmUrl = getWasmUrl(filename);
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch wasm file: ${wasmUrl}`);
    }
    const bytes = await response.arrayBuffer();
    return WebAssembly.compile(bytes);
  },

  // async compileStreaming(filename) {
  //   if (WebAssembly.compileStreaming) {
  //     return WebAssembly.compileStreaming(fetch(filename));
  //   } else {
  //     const response = await fetch(filename);
  //     return WebAssembly.compile(await response.arrayBuffer());
  //   }
  // },

  hostWrite(s) {
    port.postMessage({ id: "write", data: s });
  },
};

const onAnyMessage = async (event: MessageEvent<WorkerMessage>) => {
  switch (event.data.id) {
    case "constructor":
      port = event.data.data;
      port.onmessage = onAnyMessage;
      api = new API(apiOptions);
      break;

    case "compileToAssembly": {
      const responseId = event.data.responseId;
      let output: string | null = null;
      try {
        output = await api.compileToAssembly(event.data.data);
      } finally {
        port.postMessage(
          { id: "runAsync", responseId, data: output }
        );
      }
      break;
    }

    case "compileLinkRun":
      if (currentApp) {
        console.log("First, disallowing rAF from previous app.");
        currentApp.allowRequestAnimationFrame = false;
      }
      currentApp = await api.compileLinkRun(event.data.data);
      console.log(`finished compileLinkRun. currentApp = ${currentApp}.`);
      port.postMessage({ id: "runAsync", data: "Execution finished" });
      break;
  }
};

self.onmessage = onAnyMessage;
