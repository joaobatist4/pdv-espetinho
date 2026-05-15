import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { C } from '../../lib/tokens'
import { Badge, Btn, Card, Modal, Input, StatCard, PageHeader, Empty, useToast } from '../../components/ui'
import type { StockItemDto, SupplyDto, StockMovementDto } from '../../types'
import { fmt } from '../../lib/utils'

const adjBtn: React.CSSProperties = {
  width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 6,
  background: C.bg, cursor: 'pointer', fontSize: 16, fontWeight: 700,
  color: C.textMid, display: 'flex', alignItems: 'center', justifyContent: 'center',
}

type EntryItem = (StockItemDto | SupplyDto) & { kind: 'product' | 'supply' }

const movementBadge: Record<string, { bg: string; color: string; label: string }> = {
  Entrada: { bg: C.successBg, color: C.success, label: '▲ Entrada' },
  Saida:   { bg: C.dangerBg,  color: C.danger,  label: '▼ Saída' },
  Ajuste:  { bg: '#FFF3CD',   color: '#856404',  label: '↔ Ajuste' },
}

export default function StockPage() {
  const qc = useQueryClient()
  const { show: showToast, ToastContainer } = useToast()
  const [view, setView] = useState<'produtos' | 'insumos'>('produtos')
  const [search, setSearch] = useState('')
  const [entryModal, setEntryModal] = useState<EntryItem | null>(null)
  const [entryQty, setEntryQty] = useState('')
  const [entryNote, setEntryNote] = useState('')
  const [historyModal, setHistoryModal] = useState<EntryItem | null>(null)

  const { data: stock = [] } = useQuery<StockItemDto[]>({ queryKey: ['stock'], queryFn: async () => (await api.get('/stock')).data })
  const { data: supplies = [] } = useQuery<SupplyDto[]>({ queryKey: ['supplies'], queryFn: async () => (await api.get('/supplies')).data })

  const historyId = historyModal?.kind === 'product'
    ? (historyModal as StockItemDto).productId
    : historyModal?.kind === 'supply'
      ? (historyModal as SupplyDto).id
      : null
  const historyUrl = historyModal?.kind === 'product'
    ? `/stock/${historyId}/movements`
    : `/supplies/${historyId}/movements`

  const { data: movements = [], isFetching: loadingHistory } = useQuery<StockMovementDto[]>({
    queryKey: ['movements', historyId],
    queryFn: async () => (await api.get(historyUrl)).data,
    enabled: !!historyModal,
  })

  const adjustStock = useMutation({
    mutationFn: (p: { productId: string; delta: number; type: string }) => api.post('/stock/adjust', p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock'] }),
  })

  const adjustSupply = useMutation({
    mutationFn: (p: { supplyId: string; delta: number; type: string }) => api.patch(`/supplies/${p.supplyId}/quantity`, p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplies'] }),
  })

  const filteredStock = stock.filter((s) => !search || s.productName.toLowerCase().includes(search.toLowerCase()))
  const filteredSupplies = supplies.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.supplier.toLowerCase().includes(search.toLowerCase()))

  const lowProdCount = stock.filter((s) => s.isBelowMinimum).length
  const lowSupplyCount = supplies.filter((s) => s.isBelowMinimum).length
  const lowCount = view === 'produtos' ? lowProdCount : lowSupplyCount
  const supplyTotalValue = supplies.reduce((s, x) => s + x.quantity * x.costPerUnit, 0)

  function getItemName(item: EntryItem) { return item.kind === 'product' ? (item as StockItemDto).productName : (item as SupplyDto).name }
  function getItemQty(item: EntryItem) { return item.quantity }
  function getItemUnit(item: EntryItem) { return item.kind === 'supply' ? (item as SupplyDto).unit : 'un' }

  function handleEntry() {
    const qty = parseFloat(entryQty.replace(',', '.'))
    if (!qty || qty <= 0) { showToast('Informe uma quantidade válida', 'warn'); return }
    if (entryModal?.kind === 'product') {
      adjustStock.mutate({ productId: (entryModal as StockItemDto).productId, delta: Math.round(qty), type: 'Entrada' })
      showToast(`+${Math.round(qty)} de ${getItemName(entryModal)}`)
    } else if (entryModal?.kind === 'supply') {
      adjustSupply.mutate({ supplyId: (entryModal as SupplyDto).id, delta: qty, type: 'Entrada' })
      showToast(`+${qty} ${getItemUnit(entryModal)} de ${getItemName(entryModal)}`)
    }
    setEntryModal(null); setEntryQty(''); setEntryNote('')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="Estoque"
        subtitle={view === 'produtos' ? 'Controle de mercadorias e bebidas para venda' : 'Controle de matérias-primas e materiais de consumo'}
        actions={lowCount > 0 ? (
          <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700 }}>
            ⚠️ {lowCount} ite{lowCount !== 1 ? 'ns' : 'm'} com estoque baixo
          </div>
        ) : undefined}
      />

      <div style={{ display: 'flex', gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, alignSelf: 'flex-start' }}>
        {[{ id: 'produtos', icon: '🏪', label: 'Produtos', count: stock.length, low: lowProdCount }, { id: 'insumos', icon: '🥩', label: 'Insumos', count: supplies.length, low: lowSupplyCount }].map((t) => {
          const active = view === t.id
          return (
            <button key={t.id} onClick={() => { setView(t.id as any); setSearch('') }} style={{ border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, background: active ? C.amber : 'transparent', color: active ? '#fff' : C.textMid, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}>
              <span>{t.icon}</span><span>{t.label}</span>
              <span style={{ background: active ? 'rgba(255,255,255,.25)' : C.bg, color: active ? '#fff' : C.textMid, borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 800 }}>{t.count}</span>
              {t.low > 0 && <span style={{ background: active ? 'rgba(255,255,255,.25)' : C.dangerBg, color: active ? '#fff' : C.danger, borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>!{t.low}</span>}
            </button>
          )
        })}
      </div>

      <Input placeholder={view === 'produtos' ? '🔍  Buscar produto…' : '🔍  Buscar insumo ou fornecedor…'} value={search} onChange={setSearch} />

      <div style={{ display: 'flex', gap: 12 }}>
        {view === 'produtos' ? (
          <>
            <StatCard label="Itens com Estoque Baixo" value={lowProdCount} sub="Abaixo do mínimo" icon="⚠️" color={C.danger} />
            <StatCard label="Total de Produtos" value={stock.length} sub="com controle de estoque" icon="🏪" color={C.info} />
          </>
        ) : (
          <>
            <StatCard label="Valor em Estoque (custo)" value={supplyTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon="🥩" color={C.amber} />
            <StatCard label="Insumos Abaixo do Mínimo" value={lowSupplyCount} sub="Precisam reposição" icon="⚠️" color={C.danger} />
            <StatCard label="Total de Insumos" value={supplies.length} sub="cadastrados" icon="📋" color={C.info} />
          </>
        )}
      </div>

      {view === 'produtos' && (
        <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {['Produto', 'Qtd. Atual', 'Mínimo', 'Status', 'Ações'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Ações' ? 'center' : 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((p) => {
                  const pct = Math.min(100, Math.round((p.quantity / Math.max(1, p.minimumQuantity * 3)) * 100))
                  return (
                    <tr key={p.productId} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 600, color: C.text }}>{p.productName}</div><div style={{ fontSize: 12, color: C.textMid }}>{p.categorySlug}</div></td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: p.isBelowMinimum ? C.danger : C.text }}>{p.quantity}</span>
                          <div style={{ width: 60, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: pct + '%', background: p.isBelowMinimum ? C.danger : C.success, borderRadius: 3 }} /></div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: C.textMid }}>{p.minimumQuantity} un</td>
                      <td style={{ padding: '12px 16px' }}>{p.isBelowMinimum ? <Badge color={C.dangerBg} textColor={C.danger}>⚠️ Baixo</Badge> : <Badge color={C.successBg} textColor={C.success}>✅ OK</Badge>}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => adjustStock.mutate({ productId: p.productId, delta: -1, type: 'Saida' })} style={adjBtn}>−</button>
                          <button onClick={() => setEntryModal({ ...p, kind: 'product' })} style={{ ...adjBtn, background: C.amber, color: '#fff', border: 'none' }}>+</button>
                          <button onClick={() => setHistoryModal({ ...p, kind: 'product' })} style={{ ...adjBtn, fontSize: 13 }} title="Histórico">📋</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredStock.length === 0 && <tr><td colSpan={5}><Empty icon="📦" msg="Nenhum produto encontrado" /></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === 'insumos' && (
        <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {['Insumo', 'Estoque', 'Mínimo', 'Custo Total', 'Status', 'Ações'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Ações' ? 'center' : 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.map((s) => {
                  const pct = Math.min(100, Math.round((s.quantity / Math.max(1, s.minimumQuantity * 3)) * 100))
                  return (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 600, color: C.text }}>{s.name}</div><div style={{ fontSize: 12, color: C.textMid }}>{fmt(s.costPerUnit)}/{s.unit}{s.supplier ? ' · ' + s.supplier : ''}</div></td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: s.isBelowMinimum ? C.danger : C.text }}>{s.quantity}</span>
                          <span style={{ fontSize: 12, color: C.textMid }}>{s.unit}</span>
                          <div style={{ width: 50, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}><div style={{ height: '100%', width: pct + '%', background: s.isBelowMinimum ? C.danger : C.success, borderRadius: 3 }} /></div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: C.textMid }}>{s.minimumQuantity} {s.unit}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{fmt(s.quantity * s.costPerUnit)}</td>
                      <td style={{ padding: '12px 16px' }}>{s.isBelowMinimum ? <Badge color={C.dangerBg} textColor={C.danger}>⚠️ Baixo</Badge> : <Badge color={C.successBg} textColor={C.success}>✅ OK</Badge>}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => adjustSupply.mutate({ supplyId: s.id, delta: -1, type: 'Saida' })} style={adjBtn}>−</button>
                          <button onClick={() => setEntryModal({ ...s, kind: 'supply' })} style={{ ...adjBtn, background: C.amber, color: '#fff', border: 'none' }}>+</button>
                          <button onClick={() => setHistoryModal({ ...s, kind: 'supply' })} style={{ ...adjBtn, fontSize: 13 }} title="Histórico">📋</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredSupplies.length === 0 && <tr><td colSpan={6}><Empty icon="🥩" msg="Nenhum insumo encontrado" /></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de entrada */}
      <Modal open={!!entryModal} onClose={() => setEntryModal(null)} title={`Entrada de Estoque — ${entryModal ? getItemName(entryModal) : ''}`} width={420}>
        {entryModal && (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: C.bg, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.textMid }}>Estoque atual</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{getItemQty(entryModal)} {getItemUnit(entryModal)}</span>
            </div>
            <Input label={`Quantidade recebida (${getItemUnit(entryModal)})`} value={entryQty} onChange={setEntryQty} type="number" placeholder="Ex: 24" autoFocus />
            <Input label="Observação (opcional)" value={entryNote} onChange={setEntryNote} placeholder="Ex: Nota fiscal 1234" />
            {entryQty && parseFloat(entryQty.replace(',', '.')) > 0 && (
              <div style={{ background: C.successBg, borderRadius: 8, padding: '10px 16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: C.success }}>Novo estoque</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.success }}>{getItemQty(entryModal) + parseFloat(entryQty.replace(',', '.'))} {getItemUnit(entryModal)}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="secondary" onClick={() => setEntryModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</Btn>
              <Btn variant="primary" onClick={handleEntry} style={{ flex: 1, justifyContent: 'center' }} icon="✅">Confirmar Entrada</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de histórico */}
      <Modal open={!!historyModal} onClose={() => setHistoryModal(null)} title={`Histórico — ${historyModal ? getItemName(historyModal) : ''}`} width={520}>
        {historyModal && (
          <div style={{ padding: 24 }}>
            {loadingHistory ? (
              <div style={{ textAlign: 'center', color: C.textMid, padding: 32 }}>Carregando…</div>
            ) : movements.length === 0 ? (
              <Empty icon="📋" msg="Nenhuma movimentação registrada" />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['Tipo', 'De → Para', 'Data/Hora'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => {
                    const badge = movementBadge[m.type] ?? movementBadge.Ajuste
                    const unit = historyModal.kind === 'supply' ? (historyModal as SupplyDto).unit : 'un'
                    return (
                      <tr key={m.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: badge.bg, color: badge.color, borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{badge.label}</span>
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                          <span style={{ color: C.textMid }}>{m.quantidadeAntes} {unit}</span>
                          <span style={{ color: C.textMid, margin: '0 6px' }}>→</span>
                          <span style={{ color: C.text }}>{m.quantidadeDepois} {unit}</span>
                        </td>
                        <td style={{ padding: '10px 12px', color: C.textMid, whiteSpace: 'nowrap' }}>
                          {new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>

      <ToastContainer />
    </div>
  )
}
