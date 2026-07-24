import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const backendRoot = resolve(process.argv[2] || '../social-e-commerce-platform')
const controllerDir = resolve(backendRoot, 'src/main/java/com/hmdp/controller')
const apiDir = resolve('src/api')

function normalizePath(...parts) {
  const path = parts
    .filter(Boolean)
    .join('/')
    .replaceAll(/\/+/g, '/')
    .replaceAll(/\$\{[^}]+\}|\{[^}]+\}/g, ':param')
  return path.startsWith('/') ? path : `/${path}`
}

function extractMappingPath(annotationArguments = '') {
  return annotationArguments.match(/["']([^"']*)["']/)?.[1] || ''
}

async function readFilesRecursively(directory, extension) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(entry => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? readFilesRecursively(path, extension) : path
    })
  )
  return files.flat().filter(path => path.endsWith(extension))
}

async function getBackendContracts() {
  const files = await readFilesRecursively(controllerDir, '.java')
  const contracts = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const classPath = source.match(/@RequestMapping\(\s*["']([^"']+)["']\s*\)[\s\S]*?class\s+\w+/)?.[1] || ''
    const mappingPattern = /@(Get|Post|Put|Delete|Patch)Mapping(?:\(([^)]*)\))?/g

    for (const match of source.matchAll(mappingPattern)) {
      contracts.push(`${match[1].toUpperCase()} ${normalizePath(classPath, extractMappingPath(match[2]))}`)
    }
  }

  return new Set(contracts)
}

async function getFrontendContracts() {
  const files = await readFilesRecursively(apiDir, '.js')
  const contracts = []
  const requestPattern = /request\.(get|post|put|delete|patch)\(\s*([`'"])(.*?)\2/g

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    for (const match of source.matchAll(requestPattern)) {
      contracts.push(`${match[1].toUpperCase()} ${normalizePath(match[3])}`)
    }
  }

  return new Set(contracts)
}

const [backendContracts, frontendContracts] = await Promise.all([
  getBackendContracts(),
  getFrontendContracts()
])

const missing = [...backendContracts].filter(contract => !frontendContracts.has(contract)).sort()
const unknown = [...frontendContracts].filter(contract => !backendContracts.has(contract)).sort()

if (missing.length || unknown.length) {
  if (missing.length) {
    console.error(`前端缺少 ${missing.length} 个后端接口：\n${missing.join('\n')}`)
  }
  if (unknown.length) {
    console.error(`前端存在 ${unknown.length} 个后端未定义接口：\n${unknown.join('\n')}`)
  }
  process.exitCode = 1
} else {
  console.log(`接口契约检查通过：前后端共 ${backendContracts.size} 个接口。`)
}
