import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService } from '../../services/orders.service'
import { C, orderStatusColors } from '../../lib/tokens'
import { Badge, Btn, Card, Modal, PageHeader, Empty, useToast } from '../../components/ui'
import { fmt, fmtDate, fmtTime } from '../../lib/utils'
import type { OrderDetailDto, OrderReportParams } from '../../types'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'Aberto', label: 'Aberto' },
  { value: 'Fechado', label: 'Fechado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const defaultParams: OrderReportParams = { page: 1, pageSize: 20 }

export default function OrdersPage() {
  const qc = useQueryClient()
  const { show: showToast, ToastContainer } = useToast()

  // estado dos campos do formulário (não disparam query diretamente)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(20)

  // parâmetros aplicados — só mudam ao clicar Filtrar ou navegar entre páginas
  const [applied, setApplied] = useState<OrderReportParams>(defaultParams)

  const [selected, setSelected] = useState<OrderDetailDto | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const applyFilters = () => {
    setApplied({
      search: search.trim() || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: 1,
      pageSize,
    })
  }

  const clearFilters = () => {
    setSearch(''); setStatus(''); setDateFrom(''); setDateTo('')
    setPageSize(20)
    setApplied(defaultParams)
  }

  const goToPage = (p: number) => setApplied(prev => ({ ...prev, page: p }))

  const hasActiveFilters = !!(search || status || dateFrom || dateTo)

  const { data, isFetching } = useQuery({
    queryKey: ['orders-report', applied],
    queryFn: () => ordersService.getReport(applied),
    placeholderData: (prev) => prev,
    refetchOnMount: 'always',
  })

  const cancelOrder = useMutation({
    mutationFn: (orderId: string) => ordersService.cancel(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders-report'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      setSelected(null)
      setConfirmCancel(false)
      showToast('🗑️ Pedido cancelado')
    },
  })

  const handleRowClick = async (id: string) => {
    const order = await ordersService.getById(id)
    setSelected(order)
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0
  const currentPage = applied.page
  const from = data && data.total > 0 ? (currentPage - 1) * applied.pageSize + 1 : 0
  const to = data ? Math.min(currentPage * applied.pageSize, data.total) : 0

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px',
    fontSize: 13, fontFamily: 'inherit', background: C.surface, color: C.text,
    outline: 'none',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Relatório de Pedidos"
        subtitle="Consulte o histórico completo de pedidos com filtros e busca"
      />

      {/* Filtros */}
      <Card style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            style={{ ...inputStyle, flex: '1 1 220px', minWidth: 180 }}
            placeholder="🔍 Buscar por mesa, atendente ou produto…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{ ...inputStyle, flex: '0 0 auto' }}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
            <span style={{ fontSize: 12, color: C.textLight, whiteSpace: 'nowrap' }}>De</span>
            <input type="date" style={inputStyle} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
            <span style={{ fontSize: 12, color: C.textLight, whiteSpace: 'nowrap' }}>Até</span>
            <input type="date" style={inputStyle} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <select
            style={{ ...inputStyle, flex: '0 0 auto' }}
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n} por página</option>)}
          </select>
          <Btn variant="primary" onClick={applyFilters} style={{ whiteSpace: 'nowrap' }}>
            Filtrar
          </Btn>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{ ...inputStyle, color: C.danger, cursor: 'pointer', border: `1px solid ${C.danger}` }}
            >
              Limpar
            </button>
          )}
        </div>
      </Card>

      {/* Tabela */}
      <div style={{ flex: 1, overflow: 'auto', opacity: isFetching ? 0.6 : 1, transition: 'opacity .15s' }}>
        {!data || data.items.length === 0 ? (
          <Empty icon="📋" msg="Nenhum pedido encontrado para os filtros aplicados" />
        ) : (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                  {['Mesa', 'Atendente', 'Status', 'Abertura', 'Fechamento', 'Itens', 'Total'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: C.textMid, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.items.map((order, i) => {
                  const sc = orderStatusColors[order.status] ?? orderStatusColors['Aberto']
                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order.id)}
                      style={{
                        borderBottom: i < data.items.length - 1 ? `1px solid ${C.border}` : 'none',
                        cursor: 'pointer',
                        transition: 'background .1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: C.text }}>{order.tableLabel}</td>
                      <td style={{ padding: '11px 14px', color: C.textMid }}>{order.attendantName}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                      </td>
                      <td style={{ padding: '11px 14px', color: C.textMid, whiteSpace: 'nowrap' }}>
                        {fmtDate(order.openedAt)} {fmtTime(order.openedAt)}
                      </td>
                      <td style={{ padding: '11px 14px', color: C.textMid, whiteSpace: 'nowrap' }}>
                        {order.closedAt ? `${fmtDate(order.closedAt)} ${fmtTime(order.closedAt)}` : '—'}
                      </td>
                      <td style={{ padding: '11px 14px', color: C.textMid, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={order.itemsSummary}>
                          {order.itemCount > 0 ? order.itemsSummary || `${order.itemCount} item(s)` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontWeight: 700, color: C.amber, whiteSpace: 'nowrap' }}>
                        {fmt(order.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Paginação */}
      {data && data.total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: C.textMid }}>
            {from}–{to} de <strong>{data.total}</strong> pedido{data.total !== 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <Btn variant="secondary" size="sm" onClick={() => goToPage(1)} disabled={currentPage === 1}>««</Btn>
            <Btn variant="secondary" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>‹ Anterior</Btn>
            <span style={{ fontSize: 13, color: C.text, padding: '0 8px', fontWeight: 600 }}>
              {currentPage} / {totalPages}
            </span>
            <Btn variant="secondary" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>Próxima ›</Btn>
            <Btn variant="secondary" size="sm" onClick={() => goToPage(totalPages)} disabled={currentPage >= totalPages}>»»</Btn>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`${selected?.tableLabel} — Detalhes do Pedido`} width={560}>
        {selected && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: C.textMid }}>
              <span>👩‍💼 {selected.attendantName}</span>
              <span>📅 {fmtDate(selected.openedAt)} {fmtTime(selected.openedAt)}</span>
              {selected.closedAt && <span>🔒 {fmtDate(selected.closedAt)} {fmtTime(selected.closedAt)}</span>}
              <span style={{ marginLeft: 'auto', fontWeight: 700, color: C.amber, fontSize: 16 }}>{fmt(selected.total)}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.quantity}× {item.productName}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                      {fmt(item.unitPrice)} un · {item.goesToKitchen ? '🍳 Cozinha' : '🏃 Direto'}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(item.total)}</span>
                </div>
              ))}
            </div>

            {selected.status === 'Aberto' && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmCancel(true)}
                  style={{ border: 'none', background: 'transparent', color: C.danger, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  🗑️ Cancelar este pedido
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancelar pedido" width={420}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.dangerBg, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 22 }}>⚠️</div>
            <div style={{ fontSize: 13, color: C.danger, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Esta ação não pode ser desfeita.</div>
              Todos os itens serão descartados e a mesa voltará ao status <b>Livre</b>. O cancelamento não gera venda.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="secondary" onClick={() => setConfirmCancel(false)} style={{ flex: 1, justifyContent: 'center' }}>Voltar</Btn>
            <Btn variant="danger" onClick={() => selected && cancelOrder.mutate(selected.id)} disabled={cancelOrder.isPending} style={{ flex: 1, justifyContent: 'center' }} icon="🗑️">
              {cancelOrder.isPending ? 'Cancelando…' : 'Confirmar'}
            </Btn>
          </div>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  )
}
