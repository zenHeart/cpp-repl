import { WorkerAPI } from "../wasm/WorkAPI";

let terminalCallback: ((output: string) => void) | null = null;

// @ts-ignore
const api = new WorkerAPI({
  onWrite(event: MessageEvent) {
    if (terminalCallback && event.data.data) {
      // 格式化输出
      const formattedOutput = formatOutput(event.data.data);
      terminalCallback(formattedOutput);
    }
  }
});

// 添加格式化函数
function formatOutput(output: string): string {
  // 移除开头的多余空格
  const lines = output.split('\n').map(line => line.trimStart());
  
  // 处理特殊行
  const formattedLines = lines.map(line => {
    // 处理编译信息行
    if (line.startsWith('>')) {
      return '\r\n\x1b[36m' + line + '\x1b[0m\r\n'; // 使用青色显示编译信息
    }
    // 处理标题行
    if (line.includes('===')) {
      return '\r\n\x1b[33m' + line + '\x1b[0m\r\n'; // 使用黄色显示标题
    }
    // 处理错误信息
    if (line.includes('error:')) {
      return '\x1b[31m' + line + '\x1b[0m\r\n'; // 使用红色显示错误
    }
    // 普通输出行
    return line + '\r\n';
  });

  return formattedLines.join('');
}

export function setTerminalCallback(callback: (output: string) => void) {
  terminalCallback = callback;
}

interface CompileResult {
  success: boolean;
  output: string;
  error?: string;
}


export async function compileAndRun(sourceCode: string): Promise<CompileResult> {
  try {
    api.compileLinkRun(sourceCode)
    return {
      success: true,
      output:  '程序运行完成，无输出'
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}