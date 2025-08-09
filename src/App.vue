<template>
  <div class="editor-container">
    <input 
      type="file" 
      ref="fileInput" 
      accept=".cpp,.cc,.h,.hpp"
      style="display: none"
      @change="onFileSelected"
    />
    
    <div class="toolbar">
      <div class="toolbar-group">
        <div 
          class="file-menu" 
          @mouseenter="showFileMenu = true" 
          @mouseleave="hideFileMenu"
        >
          <span class="file-icon">📄 文件</span>
          <div 
            class="file-dropdown" 
            v-show="showFileMenu"
            @click.stop
          >
            <div 
              class="menu-item" 
              @click="handleOpenFile"
              @mouseenter="menuItemHovered = true"
              @mouseleave="menuItemHovered = false"
            >打开</div>
            <div class="menu-item" @click="handleSave">保存</div>
          </div>
        </div>
        
        <input 
          v-model="filename" 
          placeholder="请输入项目名称" 
          class="filename-input"
        />

        <button class="action-btn submit">提交</button>
        <button 
          class="action-btn run" 
          @click="handleRun"
          :disabled="isRunning"
        >
          <span class="icon">{{ isRunning ? '⌛' : '▶' }}</span>
          {{ isRunning ? '运行中...' : '运行' }}
        </button>
        <button 
          class="action-btn clear" 
          @click="handleClear"
        >
          <span class="icon">🗑</span>
          清空
        </button>
        <button class="action-btn return">返回</button>
      </div>
    </div>

    <div class="main-content">
      <div 
        ref="editorContainer" 
        class="monaco-editor"
        :style="{ right: `${terminalWidth}px` }"
      ></div>
      
      <div 
        class="resize-handle"
        @mousedown="startResize"
        :style="{ right: `${terminalWidth}px` }"
      ></div>

      <div 
        class="terminal-panel"
        :style="{ width: `${terminalWidth}px` }"
      >
        <div class="terminal-header">终端输出</div>
        <div ref="terminalContainer" class="terminal-content"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { compileAndRun, setTerminalCallback } from './utils/compiler'
import demoCpp from './demo.cpp?raw'

// 引入xterm样式
import '@xterm/xterm/css/xterm.css'

// 添加类型声明
const filename = ref<string>('')
const editorContainer = ref<HTMLElement | null>(null)
const terminalContainer = ref<HTMLElement | null>(null)
const showFileMenu = ref<boolean>(false)
const menuItemHovered = ref<boolean>(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 添加编辑器和终端的类型
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null
const isRunning = ref<boolean>(false)
const terminalWidth = ref<number>(400)
let isResizing = false

// 修改事件处理函数的类型
const startResize = (_e: MouseEvent): void => {
  isResizing = true
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.userSelect = 'none'
}

const handleResize = (e: MouseEvent): void => {
  if (!isResizing) return
  
  const containerWidth = editorContainer.value?.parentElement?.clientWidth || 0
  const newWidth = containerWidth - e.clientX
  
  terminalWidth.value = Math.min(Math.max(200, newWidth), containerWidth - 200)
  
  fitAddon?.fit()
}

const stopResize = (): void => {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
  
  editor?.layout()
  fitAddon?.fit()
}

// 修改文件处理函数的类型
const handleOpenFile = (): void => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    try {
      const content = await file.text()
      
      if (editor) {
        editor.setValue(content)
      }
      
      filename.value = file.name
      input.value = ''
    } catch (error) {
      console.error('读取文件失败:', error)
      if (terminal) {
        terminal.writeln('\x1b[31m错误: 读取文件失败\x1b[0m\r\n')
      }
    }
  }
}

const hideFileMenu = (): void => {
  if (!menuItemHovered.value) {
    showFileMenu.value = false
  }
}

const handleSave = (): void => {
  if (!editor) return
  
  try {
    const content = editor.getValue()
    const saveFilename = filename.value || 'untitled.cpp'
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = saveFilename
    
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    if (terminal) {
      terminal.writeln('\x1b[32m文件保存成功: ' + saveFilename + '\x1b[0m\r\n')
    }
  } catch (error) {
    console.error('保存文件失败:', error)
    if (terminal) {
      terminal.writeln('\x1b[31m错误: 保存文件失败\x1b[0m\r\n')
    }
  }
}

const handleClear = (): void => {
  if (terminal) {
    terminal.clear()
    terminal.reset()
    terminal.write('\x1b[2J\x1b[H')
    isRunning.value = false
  }
}

const handleRun = async (): Promise<void> => {
  if (!editor || !terminal || isRunning.value) return
  
  try {
    isRunning.value = true
    terminal.clear()
    terminal.writeln('\x1b[1m\x1b[34m=== 开始编译运行 ===\x1b[0m\r\n')
    
    const sourceCode = editor.getValue()
    const result = await compileAndRun(sourceCode)
    
    if (!result.success) {
      terminal.writeln('\x1b[31m错误:\x1b[0m\r\n' + result.error)
    }
  } catch (error) {
    terminal.writeln('\x1b[31m系统错误:\x1b[0m\r\n' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    isRunning.value = false
  }
}

onMounted(async () => {
  // 加载默认文件
  filename.value = 'demo'
  
  // 初始化编辑器
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: demoCpp,
      language: 'cpp',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: false
      }
    })
  }
  
  // 初始化终端
  terminal = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff',
      cyan: '#56b6c2',    // 编译信息的颜色
      yellow: '#e5c07b',  // 标题的颜色
      red: '#e06c75',     // 错误信息的颜色
    },
    convertEol: true,
    scrollback: 1000,
    cols: 100,            // 设置合适的列数
  })
  
  // 使用FitAddon来自适应容器大小
  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  
  // 打开终端
  if (terminalContainer.value) {
    terminal.open(terminalContainer.value)
  }
  fitAddon.fit()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    editor?.layout()
    fitAddon?.fit()
  })
  
  // 设置终端回调
  setTerminalCallback((output: string) => {
    terminal?.write(output);
  });
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', () => {
    fitAddon?.fit()
  })
  terminal?.dispose()
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})

// ... 保持其他脚本逻辑不变 ...
</script>

<style>
.editor-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 50px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 12px; /* 统一设置元素间距 */
}

/* 文件菜单样式 */
.file-menu {
  position: relative;
  padding: 8px 0;
  color: #0066ff;
  cursor: pointer;
  z-index: 1000; /* 确保菜单在最上层 */
}

.file-icon {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1001; /* 确保下拉菜单在最上层 */
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background: #f5f5f5;
}

/* 文件名输入框样式 */
.filename-input {
  width: 300px; /* 固定宽度 */
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

/* 操作按钮样式 */
.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  transition: background-color 0.2s;
}

.action-btn.submit {
  background: #0066ff;
  color: white;
}

.action-btn.run {
  background: #0066ff;
  color: white;
}

.action-btn.clear {
  background: #f5f5f5;
  color: #333;
}

.action-btn.return {
  background: white;
  border: 1px solid #e0e0e0;
  color: #333;
}

.action-btn:hover {
  opacity: 0.9;
}

.icon {
  font-size: 12px;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.monaco-editor {
  flex: 1;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  /* right 值现在由动态样式控制 */
}

.terminal-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  /* width 值现在由动态样式控制 */
}

.terminal-header {
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  color: #ffffff;
  font-weight: 500;
}

.terminal-content {
  flex: 1;
  padding: 8px;
}

/* 确保xterm容器能够正确展示 */
.terminal-content .xterm {
  height: 100%;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.running .icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 添加拖动条样式 */
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: transparent;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle:hover {
  background: rgba(0, 102, 255, 0.2);
}

.resize-handle:active {
  background: rgba(0, 102, 255, 0.4);
}
</style>