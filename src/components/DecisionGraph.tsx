import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, { Node, Edge, Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import type { DecisionGraph as DecisionGraphType } from '../types'
import { Trade } from '../types'
import { useGetTradeQuery, useParseDecisionGraphMutation } from '../api/apiSlice'

interface DecisionGraphProps {
  tradeId?: string
  trade?: Trade
}

export default function DecisionGraph({ tradeId, trade: propTrade }: DecisionGraphProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const actualTradeId = tradeId || id

  const shouldSkip = !actualTradeId || actualTradeId === '' || actualTradeId === 'undefined' || !!propTrade
  const { data: fetchedTrade } = useGetTradeQuery(actualTradeId || '', {
    skip: shouldSkip
  })
  const [parseGraph, { data: graphData, isLoading }] = useParseDecisionGraphMutation()

  const trade = propTrade || fetchedTrade
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])

  useEffect(() => {
    if (trade) {
      // Generate mock graph if no parsed data
      if (!graphData && !isLoading) {
        generateMockGraph(trade)
      } else if (graphData) {
        // Use parsed graph data
        const parsedData = graphData as DecisionGraphType
        setNodes(
          parsedData.nodes.map((n) => ({
            id: n.id,
            type: 'default',
            data: { label: n.label, ...n.data },
            position: n.position,
          }))
        )
        setEdges(
          parsedData.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
          }))
        )
      }
    }
  }, [trade, graphData, isLoading])

  const generateMockGraph = (t: Trade) => {
    const mockNodes: Node[] = [
      {
        id: 'trigger',
        type: 'default',
        data: { label: `Trigger: ${t.quickReason || 'Market signal'}` },
        position: { x: 250, y: 0 },
      },
      {
        id: 'emotion',
        type: 'default',
        data: {
          label: `Emotions: ${t.preEntryEmotions.map((e) => e.type).join(', ')}`,
        },
        position: { x: 250, y: 100 },
      },
      {
        id: 'belief',
        type: 'default',
        data: { label: `Belief: Conviction ${t.conviction}/10` },
        position: { x: 250, y: 200 },
      },
      {
        id: 'action',
        type: 'default',
        data: { label: `Action: ${t.direction.toUpperCase()} ${t.instrument}` },
        position: { x: 250, y: 300 },
      },
      {
        id: 'trade',
        type: 'default',
        data: {
          label: `Trade: ${t.instrument}`,
          tradeId: t.id,
        },
        position: { x: 250, y: 400 },
      },
    ]

    if (t.status === 'closed' && t.pnl !== undefined) {
      mockNodes.push({
        id: 'outcome',
        type: 'default',
        data: {
          label: `Outcome: ${t.pnl > 0 ? 'Win' : 'Loss'} ${t.pnl > 0 ? '+' : ''}${t.pnl}`,
        },
        position: { x: 250, y: 500 },
      })
    }

    const mockEdges: Edge[] = [
      { id: 'e1', source: 'trigger', target: 'emotion' },
      { id: 'e2', source: 'emotion', target: 'belief' },
      { id: 'e3', source: 'belief', target: 'action' },
      { id: 'e4', source: 'action', target: 'trade' },
    ]

    if (t.status === 'closed') {
      mockEdges.push({ id: 'e5', source: 'trade', target: 'outcome' })
    }

    setNodes(mockNodes)
    setEdges(mockEdges)
  }

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    if (node.data.tradeId) {
      navigate(`/trade/${node.data.tradeId}`)
    }
  }

  const handleAnalyze = async () => {
    if (trade) {
      const journalText = `${trade.preEntryJournal || ''} ${trade.postExitJournal || ''}`
      try {
        await parseGraph({ tradeId: trade.id, journalText }).unwrap()
      } catch (error) {
        console.error('Failed to parse graph:', error)
        // Fallback to mock graph
        generateMockGraph(trade)
      }
    }
  }

  if (!trade) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No trade data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-96 border border-gray-200 rounded-lg bg-white">
      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Decision Graph</h3>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
