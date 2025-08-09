export function getWasmUrl(filename: string) {
  // 使用 import.meta.env.BASE_URL 获取基础路径
  // BASE_URL 会自动包含末尾的斜杠，所以不需要额外添加
  return `${import.meta.env.BASE_URL}wasm/${filename}`;
}