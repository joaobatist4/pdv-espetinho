import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../../services/orders.service'
import { useKitchenHub } from '../../hooks/useKitchenHub'
import { C } from '../../lib/tokens'
import type { OrderItemStatus } from '../../types'
import { fmtElapsed } from '../../lib/utils'

const kitchenStatuses: OrderItemStatus[] = ['Aguardando', 'Preparando', 'Pronto']

const cardBorders: Record<string, string> = {
  Aguardando: '#F59E0B',
  Preparando: '#3B82F6',
  Pronto: '#16A34A',
}

const nextStatus: Record<string, OrderItemStatus> = {
  Aguardando: 'Preparando', Preparando: 'Pronto', Pronto: 'Entregue', Entregue: 'Entregue',
}

export default function KitchenPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState<OrderItemStatus>('Aguardando')

  const { data: orders = [], refetch } = useQuery({
    queryKey: ['open-orders'],
    queryFn: ordersService.getOpen,
    refetchInterval: 30000,
  })

  useKitchenHub({ onNewOrder: () => refetch(), onItemStatusChanged: () => refetch() })

  const updateStatus = useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: string; itemId: string; status: OrderItemStatus }) =>
      ordersService.updateItemStatus(orderId, itemId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['open-orders'] }),
  })

  const filteredOrders = orders
    .map(o => ({ ...o, items: o.items.filter(i => i.goesToKitchen && i.status === filter) }))
    .filter(o => o.items.length > 0)

  const borderColor = cardBorders[filter]

  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: '#fff', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo.png" alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 20, color: C.amber }}>Display da Cozinha</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', letterSpacing: 1 }}>ESPETIM DO BIGODE</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {kitchenStatuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', background: filter === s ? C.amber : '#1F2937', color: filter === s ? '#fff' : 'rgba(255,255,255,.5)', transition: 'all .15s' }}>
              {s === 'Aguardando' ? '⏳' : s === 'Preparando' ? '🍳' : '✅'} {s}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'rgba(255,255,255,.3)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Nenhum item {filter.toLowerCase()}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ background: '#1F2937', borderRadius: 14, border: `2px solid ${borderColor}`, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 22, color: '#fff' }}>{order.tableLabel}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{fmtElapsed(order.openedAt)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '12px 14px' }}>
                    <div>
                      <span style={{ fontSize: 22, fontWeight: 900, color: C.amber, marginRight: 10 }}>{item.quantity}×</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{item.productName}</span>
                    </div>
                    <button onClick={() => updateStatus.mutate({ orderId: order.id, itemId: item.id, status: nextStatus[item.status] })} style={{ border: 'none', background: borderColor, color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>✓</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
