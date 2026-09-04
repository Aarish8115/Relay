"use client"

import { useMemo } from "react"
import { useEdges, useNodes, type Edge } from "@xyflow/react"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "../nodes/node-registry"

export type UpstreamConnection = {
  token: string
  label: string
  type: NodeType
}

export function useUpstreamConnections(
  selectedNode: StepNodeType | undefined
): UpstreamConnection[] {
  const nodes = useNodes<StepNodeType>()
  const edges = useEdges<Edge>()

  return useMemo(() => {
    if (!selectedNode) return []

    const nodesById = new Map(nodes.map((node) => [node.id, node]))
    const upstreamById = new Map<string, string[]>()

    for (const edge of edges) {
      const upstream = upstreamById.get(edge.target) ?? []
      upstream.push(edge.source)
      upstreamById.set(edge.target, upstream)
    }

    const upstreamNodes: StepNodeType[] = []
    const visited = new Set<string>([selectedNode.id])
    const pending = [...(upstreamById.get(selectedNode.id) ?? [])]

    while (pending.length > 0) {
      const nodeId = pending.shift()!
      if (visited.has(nodeId)) continue

      visited.add(nodeId)
      const node = nodesById.get(nodeId)
      if (!node) continue

      upstreamNodes.push(node)
      pending.push(...(upstreamById.get(nodeId) ?? []))
    }

    return upstreamNodes.flatMap((node) =>
      nodeRegistry[node.data.type].outputs.map((output) => ({
        token: `{{ ${node.id}.${output.path} }}`,
        label: `${node.data.title} · ${output.label}`,
        type: node.data.type,
      }))
    )
  }, [edges, nodes, selectedNode])
}
