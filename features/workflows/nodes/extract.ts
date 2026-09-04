import { Stagehand } from "@browserbasehq/stagehand"

export async function extract({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  const result = await stagehand.extract(
    `${instruction}. Return the answer as a concise JSON-encoded string.`
  )

  return { result: result.data.extraction }
}
