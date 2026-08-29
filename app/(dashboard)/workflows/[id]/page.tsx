import { notFound } from "next/navigation"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <div className="flex flex-col gap-4 p-4">Workflow {id}</div>
}
