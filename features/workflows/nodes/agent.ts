import { Stagehand } from "@browserbasehq/stagehand"

const maxSteps = 10

export async function agent({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  for (let step = 0; step < maxSteps; step += 1) {
    const { data: actions } = await stagehand.observe(instruction)

    if (actions.length === 0) {
      return {
        succeeded: true,
        message: `Completed after ${step} action${step === 1 ? "" : "s"}.`,
        completed: true,
      }
    }

    const result = await stagehand.act(actions[0])

    if (!result.data.success) {
      return {
        succeeded: false,
        message: result.data.message,
        completed: false,
      }
    }
  }

  return {
    succeeded: false,
    message: `Stopped after reaching the ${maxSteps}-action limit.`,
    completed: false,
  }
}
