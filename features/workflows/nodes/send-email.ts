import { resend } from "@/lib/resend"

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: string
}) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject,
    text: body,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Resend did not return an email ID")
  }

  return { id: data.id }
}