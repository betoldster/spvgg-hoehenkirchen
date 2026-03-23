export const prerender = false

import type { APIRoute } from 'astro'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse, stringify } from 'yaml'

const YAML_PATH = join(process.cwd(), 'src/content/singletons/spielplan.yaml')
const ALLOWED_STATUSES = ['kommend', 'abgeschlossen']
const MAX_ENTRIES = 500
const MAX_STRING_LEN = 200

function readYaml() {
  return parse(readFileSync(YAML_PATH, 'utf-8'))
}

function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function validateSpiele(payload: unknown): string | null {
  if (!Array.isArray(payload)) return 'Payload muss ein Array sein'
  if (payload.length > MAX_ENTRIES) return `Maximal ${MAX_ENTRIES} Einträge erlaubt`

  for (const item of payload) {
    if (typeof item !== 'object' || item === null || Array.isArray(item))
      return 'Jedes Element muss ein Objekt sein'

    const s = item as Record<string, unknown>

    if (typeof s.datum !== 'string' || !s.datum.trim())
      return 'Feld "datum" fehlt oder ist ungültig'

    if (!ALLOWED_STATUSES.includes(s.status as string))
      return `Feld "status" muss "kommend" oder "abgeschlossen" sein`

    for (const field of ['datum', 'uhrzeit', 'mannschaft', 'heim', 'gast', 'ort', 'liga'] as const) {
      if (s[field] !== undefined && s[field] !== null) {
        if (typeof s[field] !== 'string')
          return `Feld "${field}" muss ein String sein`
        if ((s[field] as string).length > MAX_STRING_LEN)
          return `Feld "${field}" ist zu lang (max. ${MAX_STRING_LEN} Zeichen)`
      }
    }

    for (const field of ['heimTor', 'gastTor'] as const) {
      if (s[field] !== undefined && s[field] !== null) {
        if (typeof s[field] !== 'number' || !Number.isInteger(s[field]) || (s[field] as number) < 0 || (s[field] as number) > 99)
          return `Feld "${field}" muss eine ganze Zahl zwischen 0 und 99 sein`
      }
    }
  }

  return null
}

export const GET: APIRoute = () => {
  const data = readYaml()
  return new Response(JSON.stringify(data.spiele ?? []), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return err('Ungültiges JSON')
  }

  const validationError = validateSpiele(payload)
  if (validationError) return err(validationError)

  const data = readYaml()
  data.spiele = payload
  writeFileSync(YAML_PATH, stringify(data))

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
