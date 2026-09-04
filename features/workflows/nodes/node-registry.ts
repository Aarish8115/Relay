import type { Node } from "@xyflow/react"
import {
  Bot,
  Eye,
  FileText,
  Globe,
  Mail,
  MousePointerClick,
  Play,
  type LucideIcon,
} from "lucide-react"

export type StepNodeKind = "trigger" | "action"

// One editable field on a node, rendered as an input in the inspector later.
export type NodeField = {
  key: string
  label: string
  placeholder?: string
  multiline?: boolean
  required?: boolean
}

export type NodeOutput = {
  path: string
  label: string
}

// A node type's manifest entry. Add a node by adding an entry to nodeRegistry.
export type NodeDefinition = {
  type: string
  kind: StepNodeKind
  label: string
  icon: LucideIcon
  accent: string // Tailwind classes for the icon chip color
  fields: NodeField[]
  outputs: NodeOutput[]
}

export const nodeRegistry = {
  start: {
    type: "start",
    kind: "trigger",
    label: "Start",
    icon: Play,
    accent: "bg-blue-500 text-white",
    fields: [],
    outputs: [],
  },
  "open-url": {
    type: "open-url",
    kind: "action",
    label: "Open URL",
    icon: Globe,
    accent: "bg-emerald-500 text-white",
    fields: [
      {
        key: "url",
        label: "URL",
        placeholder: "https://youtube.com",
        required: true,
      },
      // {
      //   key: "description",
      //   label: "Description",
      //   placeholder: "Big Text",
      //   multiline: true,
      // },
    ],
    outputs: [
      { path: "url", label: "URL" },
      { path: "title", label: "Titles" },
    ],
  },
  act: {
    type: "act",
    kind: "action",
    label: "Act",
    icon: MousePointerClick,
    accent: "bg-violet-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Click the sign in button",
        multiline: true,
        required: true,
      },
    ],
    outputs: [
      { path: "worked", label: "Worked" },
      { path: "message", label: "Message" },
      { path: "url", label: "URL" },
    ],
  },
  extract: {
    type: "extract",
    kind: "action",
    label: "Extract",
    icon: FileText,
    accent: "bg-amber-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Extract the article title and author",
        multiline: true,
        required: true,
      },
    ],
    outputs: [{ path: "result", label: "Result" }],
  },
  observe: {
    type: "observe",
    kind: "action",
    label: "Observe",
    icon: Eye,
    accent: "bg-sky-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Find the sign in button",
        multiline: true,
        required: true,
      },
    ],
    outputs: [{ path: "matches", label: "Matches" }],
  },
  agent: {
    type: "agent",
    kind: "action",
    label: "Agent",
    icon: Bot,
    accent: "bg-fuchsia-500 text-white",
    fields: [
      {
        key: "instruction",
        label: "Instruction",
        placeholder: "Search for the latest product announcement",
        multiline: true,
        required: true,
      },
    ],
    outputs: [
      { path: "succeeded", label: "Succeeded" },
      { path: "message", label: "Message" },
      { path: "completed", label: "Completed" },
    ],
  },
  "send-email": {
    type: "send-email",
    kind: "action",
    label: "Send Email",
    icon: Mail,
    accent: "bg-rose-500 text-white",
    fields: [
      {
        key: "to",
        label: "Recipient",
        placeholder: "delivered@resend.dev",
        required: true,
      },
      {
        key: "subject",
        label: "Subject",
        placeholder: "Your subject",
        required: true,
      },
      {
        key: "body",
        label: "Body",
        placeholder: "Write your email",
        multiline: true,
        required: true,
      },
    ],
    outputs: [{ path: "id", label: "Email ID" }],
  },
} satisfies Record<string, NodeDefinition>

export type NodeType = keyof typeof nodeRegistry

// Plain JSON only (synced through Liveblocks later). type keys into the registry;
// kind and title are denormalized so the server can read them without the registry.
export type StepNodeData = {
  type: NodeType
  kind: StepNodeKind
  title: string
  values: Record<string, string>
}

export type StepNodeType = Node<StepNodeData, "step">

export type ActionNodeType = {
  [K in NodeType]: (typeof nodeRegistry)[K]["kind"] extends "action" ? K : never
}[NodeType]
