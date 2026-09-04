type NodeOutputs = Record<string, unknown>

function getByPath(value: unknown, path: string): unknown {
  const segments = path.match(/[^.[\]]+|\[(?:([^"'\]]+)|["']([^"']+)["'])\]/g)

  if (!segments) return undefined

  return segments.reduce<unknown>((current, segment) => {
    if (current === null || current === undefined) return undefined

    const key = segment.startsWith("[")
      ? segment.slice(1, -1).replace(/["']/g, "")
      : segment

    if (typeof current !== "object" && typeof current !== "function") {
      return undefined
    }

    return key in current
      ? (current as Record<string, unknown>)[key]
      : undefined
  }, value)
}

export function interpolate(text: string, nodeOutputs: NodeOutputs): string {
  return text.replace(/{{\s*([^{}]+?)\s*}}/g, (_, path: string) => {
    const resolved = getByPath(nodeOutputs, path.trim())

    if (resolved === null || resolved === undefined) return ""
    if (typeof resolved === "object") return JSON.stringify(resolved)

    return String(resolved)
  })
}
