import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../../services/dashboard.service'
import { C } from '../../lib/tokens'
import { Badge, Card, StatCard, PageHeader, Empty } from '../../components/ui'
import { fmt } from '../../lib/utils'

const payLabels: Record<string, string> = {
  Dinheiro: '💵 Dinheiro', Pix: '📱 PIX', Debito: '💳 Débito',
  Credito: '💳 Crédito', Fiado: '📝 Fiado', Misto: '🔀 Misto',
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('hoje')
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardService.get(period),
  })

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: C.textLight, fontSize: 14 }}>Carregando...</div>
    </div>
  )

  const maxVal = Math.max(...data.dailyChart.map((d) => d.revenue), 1)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do negócio"
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            {[['hoje', 'Hoje'], ['semana', '7 dias'], ['mes', '30 dias']].map(([v, l]) => (
              <button key={v} onClick={() => { setPeriod(v); setSelectedDay(null) }} style={{ border: `1px solid ${period === v ? C.amber : C.border}`, borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: period === v ? C.amber : C.surface, color: period === v ? '#fff' : C.textMid }}>{l}</button>
            ))}
          </div>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12 }}>
        <StatCard label="Faturamento" value={data.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sub={`Ticket médio: ${fmt(data.avgTicket)}`} icon="💰" color={C.amber} />
        <StatCard label="Pedidos Fechados" value={data.orderCount} sub={`Ticket médio: ${fmt(data.avgTicket)}`} icon="🧾" color={C.info} />
        <StatCard label="Em Aberto Agora" value={fmt(data.openRevenue)} sub={`${data.openTableCount} mesa${data.openTableCount !== 1 ? 's' : ''} ativas`} icon="🔥" color={C.warn} />
        <StatCard label="Estoque Baixo" value={data.lowStockCount} sub="Itens abaixo do mínimo" icon="⚠️" color={C.danger} />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>

        {/* Gráfico de barras customizado (igual ao protótipo) */}
        <Card style={{ flex: 2, padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Faturamento — últimos 14 dias</div>
            {selectedDay && (
              <button onClick={() => setSelectedDay(null)} style={{ border: 'none', background: C.amberLight, color: C.amber, borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                ✕ Limpar seleção
              </button>
            )}
          </div>

          {selectedDay && (
            <div style={{ background: C.amberLight, borderRadius: 10, padding: '10px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.amber, textTransform: 'capitalize' }}>{selectedDay}</div>
                <div style={{ fontSize: 12, color: C.brownMid }}>produtos mais vendidos no painel ao lado</div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {data.dailyChart.map((d, i) => {
              const barH = Math.max(4, (d.revenue / maxVal) * 180)
              const isSelected = selectedDay === d.date
              const isToday = i === data.dailyChart.length - 1
              const barColor = isSelected ? C.amber : isToday ? C.amber + '99' : d.revenue > 0 ? C.amber + '55' : C.border
              return (
                <div
                  key={i}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: d.revenue > 0 ? 'pointer' : 'default' }}
                  onClick={() => d.revenue > 0 && setSelectedDay(prev => prev === d.date ? null : d.date)}
                  title={d.revenue > 0 ? `${d.date}: ${fmt(d.revenue)} (${d.orderCount} pedido${d.orderCount !== 1 ? 's' : ''})` : d.date}
                >
                  <div style={{ fontSize: 9, color: isSelected ? C.amber : C.textMid, fontWeight: isSelected ? 800 : 500, minHeight: 12, textAlign: 'center' }}>
                    {d.revenue > 0 ? fmt(d.revenue).replace('R$ ', '').replace(',00', '') : ''}
                  </div>
                  <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: barH + 'px', background: barColor, transition: 'all .2s', outline: isSelected ? `2px solid ${C.amber}` : 'none', outlineOffset: 1, position: 'relative' }}>
                    {isSelected && <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 8, height: 8, background: C.amber, borderRadius: '50%' }} />}
                  </div>
                  <div style={{ fontSize: 9, fontWeight: isSelected || isToday ? 800 : 400, color: isSelected ? C.amber : isToday ? C.amber + 'bb' : C.textLight, whiteSpace: 'nowrap' }}>{d.date}</div>
                </div>
              )
            })}
          </div>

          {!selectedDay && (
            <div style={{ textAlign: 'center', fontSize: 11, color: C.textLight, marginTop: 10 }}>
              Clique em uma barra para ver os produtos mais vendidos naquele dia
            </div>
          )}
        </Card>

        {/* Coluna direita */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Top produtos */}
          <Card style={{ flex: 1, padding: 20, overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>🏆 Mais Vendidos</div>
              {selectedDay && <Badge color={C.amberLight} textColor={C.amber}>{selectedDay}</Badge>}
            </div>
            {data.topProducts.length === 0 && <Empty icon="📊" msg={selectedDay ? 'Sem vendas neste dia' : 'Sem dados no período'} />}
            {data.topProducts.map((p, i) => (
              <div key={p.productName} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: i < 3 ? '#fff' : C.textMid, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{p.totalQty} un · {fmt(p.totalRevenue)}</div>
                </div>
                <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: data.topProducts[0] ? (p.totalQty / data.topProducts[0].totalQty * 100) + '%' : '0%', background: C.amber, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </Card>

          {/* Pagamentos */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14 }}>💳 Pagamentos</div>
            {data.paymentBreakdown.length === 0 && <div style={{ fontSize: 13, color: C.textLight }}>Sem dados</div>}
            {[...data.paymentBreakdown].sort((a, b) => b.total - a.total).map((p) => (
              <div key={p.method} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: C.text }}>{payLabels[p.method] ?? p.method}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.percentage.toFixed(1)}%</span>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: p.percentage + '%', background: C.amber, borderRadius: 3, transition: 'width .3s' }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
