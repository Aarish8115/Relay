import { Stagehand } from "@browserbasehq/stagehand"

export async function act({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  const [page] = await stagehand.browser.context.pages()
  const result = await stagehand.act(instruction)

  return {
    worked: result.data.success,
    message: result.data.message,
    url: page.url(),
  }
}
