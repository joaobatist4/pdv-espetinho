import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../../services/orders.service'
import { C, orderItemStatusColors } from '../../lib/tokens'
import { Badge, Card, Modal, PageHeader, Empty, useToast } from '../../components/ui'
import type { OrderItemStatus } from '../../types'
import { fmt, fmtElapsed } from '../../lib/utils'

const nextStatus: Record<OrderItemStatus, OrderItemStatus | null> = {
  Aguardando: 'Preparando', Preparando: 'Pronto', Pronto: 'Entregue', Entregue: null,
}
const nextLabels: Record<string, string> = {
  Aguardando: 'Marcar Preparando', Preparando: 'Marcar Pronto', Pronto: 'Marcar Entregue',
}

export default function OrdersPage() {
  const qc = useQueryClient()
  const { show: showToast, ToastContainer } = useToast()
  const [filter, setFilter] = useState('todos')
  const [selected, setSelected] = useState<string | null>(null)

  const { data: orders = [] } = useQuery({ queryKey: ['open-orders'], queryFn: ordersService.getOpen, refetchInterval: 15000 })

  const filtered = orders.filter((o) => {
    if (filter === 'cozinha') return o.items.some((i) => i.goesToKitchen && i.status !== 'Entregue')
    if (filter === 'prontos') return o.items.some((i) => i.status === 'Pronto')
    return true
  })

  const pendingCount = orders.reduce((s, o) => s + o.items.filter((i) => i.goesToKitchen && (i.status === 'Aguardando' || i.status === 'Preparando')).length, 0)

  const updateStatus = useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: string; itemId: string; status: OrderItemStatus }) =>
      ordersService.updateItemStatus(orderId, itemId, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['open-orders'] })
      const labels: Record<string, string> = { Preparando: '⏳ Preparando', Pronto: '✅ Pronto!', Entregue: '📦 Entregue' }
      if (labels[status]) showToast(labels[status])
    },
  })

  const selOrder = selected ? orders.find((o) => o.id === selected) : null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhe e atualize o status dos pedidos em aberto"
        actions={pendingCount > 0 ? (
          <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
            🔥 {pendingCount} item{pendingCount !== 1 ? 's' : ''} na cozinha
          </div>
        ) : undefined}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        {[['todos', 'Todos'], ['cozinha', '🍳 Cozinha'], ['prontos', '✅ Prontos']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: filter === v ? C.amber : C.surface, color: filter === v ? '#fff' : C.textMid, outline: `1px solid ${filter === v ? C.amber : C.border}` }}>{l}</button>
        ))}
      </div>

      {filtered.length === 0
        ? <Empty icon="🎉" msg="Nenhum pedido pendente" />
        : (
          <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, alignContent: 'start' }}>
            {filtered.map((order) => {
              const kitchenItems = order.items.filter((i) => i.goesToKitchen)
              const hasReady = kitchenItems.some((i) => i.status === 'Pronto')
              const hasPending = kitchenItems.some((i) => i.status === 'Aguardando' || i.status === 'Preparando')
              return (
                <Card key={order.id} hover onClick={() => setSelected(order.id)} style={{ padding: 18, cursor: 'pointer', borderLeft: `4px solid ${hasPending ? C.warn : hasReady ? C.success : C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{order.tableLabel}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{order.attendantName} · {fmtElapsed(order.openedAt)}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.amber }}>{fmt(order.total)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {order.items.map((item) => {
                      const sc = orderItemStatusColors[item.status]
                      return (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 13, color: C.text }}>{item.quantity}× {item.productName}</div>
                          <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        )
      }

      <Modal open={!!selOrder} onClose={() => setSelected(null)} title={`${selOrder?.tableLabel} — Pedido`} width={540}>
        {selOrder && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, fontSize: 13, color: C.textMid }}>
              <span>👩‍💼 {selOrder.attendantName}</span>
              <span>🕐 {fmtElapsed(selOrder.openedAt)}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700, color: C.amber, fontSize: 16 }}>{fmt(selOrder.total)}</span>
            </div>
            {selOrder.items.map((item) => {
              const sc = orderItemStatusColors[item.status]
              const canAdvance = item.goesToKitchen && item.status !== 'Entregue'
              const next = nextStatus[item.status]
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: sc.bg + '66', border: `1px solid ${sc.bg}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.quantity}× {item.productName}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                      {fmt(item.unitPrice)} un · {item.goesToKitchen ? '🍳 Cozinha' : '🏃 Direto'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                    {canAdvance && next && (
                      <button onClick={() => updateStatus.mutate({ orderId: selOrder.id, itemId: item.id, status: next })} style={{ border: 'none', background: C.amber, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {nextLabels[item.status]}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Modal>

      <ToastContainer />
    </div>
  )
}
