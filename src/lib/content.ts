import { readFileSync, existsSync, readdirSync } from 'fs'
import yaml from 'yaml'
import path from 'path'

const base = () => path.join(process.cwd(), 'src/content')

export function readSingleton(name: string): any {
  const file = path.join(base(), 'singletons', `${name}.yaml`)
  if (!existsSync(file)) return {}
  return yaml.parse(readFileSync(file, 'utf-8')) ?? {}
}

export function readCollection(collection: string): any[] {
  const dir = path.join(base(), collection)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter(slug => existsSync(path.join(dir, slug, 'index.yaml')))
    .map(slug => ({
      slug,
      ...yaml.parse(readFileSync(path.join(dir, slug, 'index.yaml'), 'utf-8'))
    }))
}

export function readEntry(collection: string, slug: string): any | null {
  const file = path.join(base(), collection, slug, 'index.yaml')
  if (!existsSync(file)) return null
  return { slug, ...yaml.parse(readFileSync(file, 'utf-8')) }
}

export function readRichText(collection: string, slug: string, field: string, entryData?: any): string {
  // Check for separate file first (legacy mdoc / new md files)
  for (const ext of ['.mdoc', '.md']) {
    const file = path.join(base(), collection, slug, `${field}${ext}`)
    if (existsSync(file)) return readFileSync(file, 'utf-8')
  }
  // Fall back to inline field in YAML (for Decap CMS-created entries)
  if (entryData && entryData[field]) return entryData[field]
  return ''
}
