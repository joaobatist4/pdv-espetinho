import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService } from '../../services/products.service'
import api from '../../lib/api'
import { C, roleColors } from '../../lib/tokens'
import { Badge, Btn, Card, Modal, Input, Select, PageHeader, Empty, useToast } from '../../components/ui'
import type { UserDto } from '../../types'
import { fmt } from '../../lib/utils'

const tabs = [
  { id: 'products',    label: '📦 Produtos' },
  { id: 'supplies',   label: '🧂 Insumos' },
  { id: 'tables',     label: '🪑 Mesas' },
  { id: 'users',      label: '👥 Usuários' },
  { id: 'categories', label: '🏷️ Categorias' },
  { id: 'units',      label: '📐 Unidades' },
]

const ALL_PERMISSIONS = [
  { id: 'Pdv',           label: 'PDV / Caixa',    desc: 'Abrir pedidos e fechar contas' },
  { id: 'Orders',        label: 'Pedidos',         desc: 'Ver e atualizar status de pedidos' },
  { id: 'Stock',         label: 'Estoque Geral',   desc: 'Ajustar estoque de produtos e insumos' },
  { id: 'BeverageStock', label: 'Estoque Bebidas', desc: 'Ajustar somente bebidas' },
  { id: 'Dashboard',     label: 'Dashboard',       desc: 'Ver relatórios e gráficos' },
  { id: 'Registration',  label: 'Cadastro',        desc: 'CRUD de produtos, mesas e insumos' },
  { id: 'Users',         label: 'Usuários',        desc: 'Criar e editar usuários' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin:   ['Pdv', 'Orders', 'Stock', 'BeverageStock', 'Dashboard', 'Registration', 'Users'],
  Manager: ['Pdv', 'Orders', 'Stock', 'BeverageStock', 'Dashboard', 'Registration'],
  Waiter:  ['Pdv', 'Orders', 'BeverageStock'],
  Kitchen: [],
}

const UNIT_OPTIONS = [
  { value: 'un', label: 'Unidade (un)' },
  { value: 'kg', label: 'Quilo (kg)' },
  { value: 'g', label: 'Grama (g)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ml', label: 'Mililitro (ml)' },
  { value: 'pct', label: 'Pacote (pct)' },
  { value: 'cx', label: 'Caixa (cx)' },
]

const ICON_OPTIONS = [
  '🍢','🍖','🍗','🥩','🥓','🌭','🍔','🍕','🌮','🌯','🥙','🥗','🍽️',
  '🍲','🥘','🫕','🥣','🥫','🧆','🫔','🧇','🥞','🧈',
  '🍺','🍻','🥤','🧃','🍷','🍸','🍹','🥃','☕','🧋','🧊',
  '🧂','🌶️','🫙','🧄','🧅','🌽','🥕','🍋','🫐','🍓',
  '📦','🛒','🧹','🧻','🪣','🧴','🧼','🪤','🔥','⭐','🏷️','📋',
]

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 5 }}>Ícone</div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', height: 40, border: `1px solid ${open ? C.amber : C.border}`, borderRadius: 8, background: C.surface, cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {value || '📦'}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', display: 'grid', gridTemplateColumns: 'repeat(7, 34px)', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
          {ICON_OPTIONS.map(icon => (
            <button
              key={icon}
              type="button"
              onClick={() => { onChange(icon); setOpen(false) }}
              style={{ width: 34, height: 34, border: value === icon ? `2px solid ${C.amber}` : '1px solid transparent', borderRadius: 6, background: value === icon ? C.amberLight : 'transparent', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

const SUPPLY_CATS = [
  { value: 'carnes', label: '🥩 Carnes' },
  { value: 'bebidas', label: '🍺 Bebidas' },
  { value: 'temperos', label: '🧂 Temperos' },
  { value: 'descartaveis', label: '🧻 Descartáveis' },
  { value: 'outros', label: '📦 Outros' },
]

const TABLE_TYPES = [
  { value: 'Table',   label: '🪑 Mesa' },
  { value: 'Counter', label: '🍽️ Balcão' },
]

const ROLES = [
  { value: 'Admin',   label: '👑 Admin' },
  { value: 'Manager', label: '🏆 Gerente' },
  { value: 'Waiter',  label: '🍽️ Garçonete' },
  { value: 'Kitchen', label: '👨‍🍳 Cozinha' },
]

export default function CadastroPage() {
  const [tab, setTab] = useState('produtos')
  const [search, setSearch] = useState('')
  const { show: showToast, ToastContainer } = useToast()

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader title="Cadastro" subtitle="Gerencie produtos, insumos, mesas e usuários" />

      <div style={{ display: 'flex', borderBottom: `2px solid ${C.border}` }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => { setTab(id); setSearch('') }} style={{ border: 'none', background: 'transparent', padding: '10px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: tab === id ? C.amber : C.textMid, borderBottom: `2px solid ${tab === id ? C.amber : 'transparent'}`, marginBottom: -2, whiteSpace: 'nowrap' }}>{label}</button>
        ))}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar…" style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 14, color: C.text, background: C.surface, outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />

      {tab === 'products'   && <ProductsTab    search={search} showToast={showToast} />}
      {tab === 'supplies'   && <SuppliesTab    search={search} showToast={showToast} />}
      {tab === 'tables'     && <TablesTab      search={search} showToast={showToast} />}
      {tab === 'users'      && <UsersTab       search={search} showToast={showToast} />}
      {tab === 'categories' && <CategoriesTab  search={search} showToast={showToast} />}
      {tab === 'units'      && <UnitsTab       search={search} showToast={showToast} />}

      <ToastContainer />
    </div>
  )
}

// ── Produtos ──────────────────────────────────────────────────────────────────

function ProductsTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const { data: products = [] } = useQuery({ queryKey: ['products-admin'], queryFn: () => productsService.getAll() })
  const { data: categories = [] } = useQuery<{ id: string; name: string }[]>({ queryKey: ['categories'], queryFn: async () => (await api.get('/categories')).data })
  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  const emptyProduct = { name: '', categoryId: '', subcategory: '', price: '', unit: 'un', goesToKitchen: true, hasStock: false, isActive: true }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProduct)

  const catOptions = [{ value: '', label: 'Selecionar categoria…' }, ...categories.map(c => ({ value: c.id, label: c.name }))]

  function openNew() { setForm(emptyProduct); setEditing(null); setModal(true) }
  function openEdit(p: typeof products[0]) {
    setForm({ name: p.name, categoryId: p.categoryId, subcategory: p.subcategory ?? '', price: String(p.price), unit: p.unit, goesToKitchen: p.goesToKitchen, hasStock: p.hasStock, isActive: p.isActive })
    setEditing(p.id); setModal(true)
  }

  const save = useMutation({
    mutationFn: () => editing
      ? api.put(`/products/${editing}`, { ...form, price: parseFloat(form.price) || 0 })
      : api.post('/products', { ...form, price: parseFloat(form.price) || 0 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products-admin'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      setModal(false)
      showToast(editing ? '✅ Produto atualizado' : '✅ Produto criado')
    },
  })

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/products/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products-admin'] }); qc.invalidateQueries({ queryKey: ['products'] }) },
  })

  return (
    <>
      <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn onClick={openNew} size="sm" icon="➕">Novo Produto</Btn>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg, position: 'sticky', top: 0 }}>
                {['Produto', 'Categoria', 'Preço', 'Unidade', 'Cozinha', 'Estoque', 'Ativo', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: p.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ fontWeight: 600, color: C.text }}>{p.name}</div>
                    {p.subcategory && <div style={{ fontSize: 11, color: C.textLight }}>{p.subcategory}</div>}
                  </td>
                  <td style={{ padding: '10px 16px' }}><Badge color={C.amberLight} textColor={C.amber}>{p.categoryName}</Badge></td>
                  <td style={{ padding: '10px 16px', fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>{fmt(p.price)}</td>
                  <td style={{ padding: '10px 16px', color: C.textMid, fontSize: 13 }}>{p.unit}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{p.goesToKitchen ? '✅' : <span style={{ color: C.textLight }}>—</span>}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{p.hasStock ? '✅' : <span style={{ color: C.textLight }}>—</span>}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>{p.isActive ? '✅' : '❌'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(p)} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text }}>Editar</button>
                      <button onClick={() => toggle.mutate(p.id)} style={{ border: 'none', background: p.isActive ? C.dangerBg : C.successBg, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: p.isActive ? C.danger : C.success, fontWeight: 600 }}>{p.isActive ? 'Desativar' : 'Ativar'}</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8}><Empty icon="📦" msg="Nenhum produto encontrado" /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Produto' : 'Novo Produto'} width={520}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nome do produto" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ex: Espetinho de frango" autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Categoria" value={form.categoryId} onChange={v => setForm(f => ({ ...f, categoryId: v }))} options={catOptions} />
            <Input label="Subcategoria" value={form.subcategory} onChange={v => setForm(f => ({ ...f, subcategory: v }))} placeholder="Ex: Bovinos" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Preço (R$)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="0,00" />
            <Select label="Unidade" value={form.unit} onChange={v => setForm(f => ({ ...f, unit: v }))} options={UNIT_OPTIONS} />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: C.text }}>
              <input type="checkbox" checked={form.goesToKitchen} onChange={e => setForm(f => ({ ...f, goesToKitchen: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.amber }} />
              🍳 Vai para a cozinha
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', color: C.text }}>
              <input type="checkbox" checked={form.hasStock} onChange={e => setForm(f => ({ ...f, hasStock: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: C.amber }} />
              📦 Controla estoque
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.categoryId}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Produto'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Insumos ───────────────────────────────────────────────────────────────────

interface SupplyDto { id: string; name: string; categorySlug: string; unit: string; costPerUnit: number; quantity: number; minimumQuantity: number; supplier?: string }

function SuppliesTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const { data: supplies = [] } = useQuery<SupplyDto[]>({ queryKey: ['supplies'], queryFn: async () => (await api.get('/supplies')).data })
  const { data: supplyCategories = [] } = useQuery<SupplyCategoryDto[]>({ queryKey: ['supply-categories'], queryFn: async () => (await api.get('/supply-categories')).data })
  const filtered = supplies.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  const catOptions = supplyCategories.map(c => ({ value: c.slug, label: `${c.icon} ${c.name}` }))
  const defaultCat = supplyCategories[0]?.slug ?? 'outros'

  const emptySupply = { name: '', categorySlug: defaultCat, unit: 'kg', costPerUnit: '', quantity: '', minimumQuantity: '', supplier: '' }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptySupply)

  function openNew() { setForm({ ...emptySupply, categorySlug: defaultCat }); setEditing(null); setModal(true) }
  function openEdit(s: SupplyDto) {
    setForm({ name: s.name, categorySlug: s.categorySlug, unit: s.unit, costPerUnit: String(s.costPerUnit), quantity: String(s.quantity), minimumQuantity: String(s.minimumQuantity), supplier: s.supplier ?? '' })
    setEditing(s.id); setModal(true)
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, costPerUnit: parseFloat(form.costPerUnit) || 0, quantity: parseFloat(form.quantity) || 0, minimumQuantity: parseFloat(form.minimumQuantity) || 0 }
      return editing ? api.put(`/supplies/${editing}`, payload) : api.post('/supplies', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supplies'] })
      setModal(false)
      showToast(editing ? '✅ Insumo atualizado' : '✅ Insumo criado')
    },
  })

  const catLabel = (slug: string) => {
    const cat = supplyCategories.find(c => c.slug === slug)
    return cat ? `${cat.icon} ${cat.name}` : slug
  }

  return (
    <>
      <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn onClick={openNew} size="sm" icon="➕">Novo Insumo</Btn>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg, position: 'sticky', top: 0 }}>
                {['Insumo', 'Categoria', 'Estoque', 'Mínimo', 'Custo/Un', 'Fornecedor', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const low = s.quantity <= s.minimumQuantity
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 16px', fontWeight: 600, color: C.text }}>{s.name}</td>
                    <td style={{ padding: '10px 16px' }}><Badge color={C.amberLight} textColor={C.amber}>{catLabel(s.categorySlug)}</Badge></td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontWeight: 700, color: low ? C.danger : C.text }}>{s.quantity} {s.unit}</span>
                      {low && <span style={{ marginLeft: 6, fontSize: 11, color: C.danger }}>⚠️ baixo</span>}
                    </td>
                    <td style={{ padding: '10px 16px', color: C.textMid, fontSize: 13 }}>{s.minimumQuantity} {s.unit}</td>
                    <td style={{ padding: '10px 16px', color: C.textMid, fontSize: 13 }}>{fmt(s.costPerUnit)}</td>
                    <td style={{ padding: '10px 16px', color: C.textMid, fontSize: 13 }}>{s.supplier || <span style={{ color: C.textLight }}>—</span>}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <button onClick={() => openEdit(s)} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text }}>Editar</button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={7}><Empty icon="🧂" msg="Nenhum insumo encontrado" /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>{filtered.length} insumo{filtered.length !== 1 ? 's' : ''}</div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Insumo' : 'Novo Insumo'} width={520}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nome do insumo" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Ex: Carvão" autoFocus />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Categoria" value={form.categorySlug} onChange={v => setForm(f => ({ ...f, categorySlug: v }))} options={catOptions.length ? catOptions : SUPPLY_CATS} />
            <Select label="Unidade" value={form.unit} onChange={v => setForm(f => ({ ...f, unit: v }))} options={UNIT_OPTIONS} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Estoque atual" value={form.quantity} onChange={v => setForm(f => ({ ...f, quantity: v }))} placeholder="0" />
            <Input label="Estoque mínimo" value={form.minimumQuantity} onChange={v => setForm(f => ({ ...f, minimumQuantity: v }))} placeholder="0" />
            <Input label="Custo por un (R$)" value={form.costPerUnit} onChange={v => setForm(f => ({ ...f, costPerUnit: v }))} placeholder="0,00" />
          </div>
          <Input label="Fornecedor" value={form.supplier} onChange={v => setForm(f => ({ ...f, supplier: v }))} placeholder="Nome do fornecedor" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Insumo'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Mesas ─────────────────────────────────────────────────────────────────────

interface TableDto { id: string; number: number; label: string; type: string; status: string; isActive: boolean }

function TablesTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const [showInactive, setShowInactive] = useState(false)
  const { data: tables = [] } = useQuery<TableDto[]>({
    queryKey: ['tables-admin', showInactive],
    queryFn: async () => (await api.get(`/tables?includeInactive=${showInactive}`)).data,
  })
  const filtered = tables.filter(t => !search || t.label.toLowerCase().includes(search.toLowerCase()))

  const emptyTable = { number: '', label: '', type: 'Table', isActive: true }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<{ number: string; label: string; type: string; isActive: boolean }>(emptyTable)

  function openNew() { setForm(emptyTable); setEditing(null); setModal(true) }
  function openEdit(t: TableDto) {
    setForm({ number: String(t.number), label: t.label, type: t.type, isActive: t.isActive })
    setEditing(t.id); setModal(true)
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, number: parseInt(form.number) || 0 }
      return editing ? api.put(`/tables/${editing}`, payload) : api.post('/tables', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tables-admin'] })
      qc.invalidateQueries({ queryKey: ['tables'] })
      setModal(false)
      showToast(editing ? '✅ Mesa atualizada' : '✅ Mesa criada')
    },
  })

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/tables/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables-admin'] }); qc.invalidateQueries({ queryKey: ['tables'] }) },
  })

  const statusColors: Record<string, { bg: string; text: string }> = {
    Available:     { bg: '#dcfce7', text: '#16a34a' },
    Occupied:      { bg: '#fef9c3', text: '#a16207' },
    BillRequested: { bg: '#fee2e2', text: '#dc2626' },
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.textMid, cursor: 'pointer' }}>
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} style={{ width: 15, height: 15, accentColor: C.amber, cursor: 'pointer' }} />
          Mostrar mesas inativas
        </label>
        <Btn onClick={openNew} icon="➕">Nova Mesa</Btn>
      </div>
      <div style={{ flex: 1, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, alignContent: 'start' }}>
        {filtered.map(t => {
          const sc = statusColors[t.status] ?? { bg: C.bg, text: C.textMid }
          return (
            <Card key={t.id} style={{ padding: 18, opacity: t.isActive ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{t.type === 'Counter' ? '🍽️ Balcão' : '🪑 Mesa'}</div>
                </div>
                <Badge color={sc.bg} textColor={sc.text}>{t.status}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => openEdit(t)} style={{ flex: 1, border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '5px 0', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text, fontWeight: 600 }}>Editar</button>
                <button onClick={() => toggle.mutate(t.id)} style={{ flex: 1, border: 'none', background: t.isActive ? C.dangerBg : C.successBg, borderRadius: 6, padding: '5px 0', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: t.isActive ? C.danger : C.success, fontWeight: 600 }}>{t.isActive ? 'Desativar' : 'Ativar'}</button>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && <div style={{ gridColumn: '1 / -1' }}><Empty icon="🪑" msg="Nenhuma mesa encontrada" /></div>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Mesa' : 'Nova Mesa'} width={420}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <Input label="Número" value={form.number} onChange={v => setForm(f => ({ ...f, number: v }))} placeholder="1" autoFocus />
            <Input label="Identificação" value={form.label} onChange={v => setForm(f => ({ ...f, label: v }))} placeholder="Mesa 1 / Balcão A" />
          </div>
          <Select label="Tipo" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={TABLE_TYPES} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.label || !form.number}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Mesa'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Categorias ────────────────────────────────────────────────────────────────

interface CategoryDto { id: string; name: string; slug: string; icon: string; sortOrder: number }
interface SupplyCategoryDto { id: string; name: string; slug: string; icon: string; sortOrder: number }

function CategoriesTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const [sub, setSub] = useState<'products' | 'supplies'>('products')
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {([['products', '📦 Categorias de Produtos'], ['supplies', '🧂 Categorias de Insumos']] as const).map(([v, l]) => (
          <button key={v} onClick={() => setSub(v)} style={{ border: `1px solid ${sub === v ? C.amber : C.border}`, background: sub === v ? C.amber : C.surface, borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: sub === v ? '#fff' : C.textMid }}>{l}</button>
        ))}
      </div>
      {sub === 'products' && <ProductCategoriesTab search={search} showToast={showToast} />}
      {sub === 'supplies' && <SupplyCategoriesTab  search={search} showToast={showToast} />}
    </div>
  )
}

function ProductCategoriesTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const { data: categories = [] } = useQuery<CategoryDto[]>({ queryKey: ['categories'], queryFn: async () => (await api.get('/categories')).data })
  const filtered = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  const emptyForm = { name: '', slug: '', icon: '📦', sortOrder: '' }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openNew() { setForm(emptyForm); setEditing(null); setModal(true) }
  function openEdit(c: CategoryDto) {
    setForm({ name: c.name, slug: c.slug, icon: c.icon, sortOrder: String(c.sortOrder) })
    setEditing(c.id); setModal(true)
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 }
      return editing ? api.put(`/categories/${editing}`, payload) : api.post('/categories', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['products-admin'] })
      setModal(false)
      showToast(editing ? '✅ Categoria atualizada' : '✅ Categoria criada')
    },
  })

  return (
    <>
      <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn onClick={openNew} size="sm" icon="➕">Nova Categoria</Btn>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg, position: 'sticky', top: 0 }}>
                {['Ícone', 'Nome', 'Slug', 'Ordem', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 16px', fontSize: 22 }}>{c.icon}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: C.text }}>{c.name}</td>
                  <td style={{ padding: '10px 16px' }}><code style={{ fontSize: 12, background: C.bg, padding: '2px 6px', borderRadius: 4, color: C.textMid }}>{c.slug}</code></td>
                  <td style={{ padding: '10px 16px', color: C.textMid }}>{c.sortOrder}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => openEdit(c)} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text }}>Editar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5}><Empty icon="🏷️" msg="Nenhuma categoria encontrada" /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>{filtered.length} categoria{filtered.length !== 1 ? 's' : ''}</div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria'} width={440}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <IconPicker value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} />
            <Input label="Nome" value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: editing ? f.slug : toSlug(v) }))} placeholder="Ex: Espetos" autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Slug</label>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 14, color: C.textLight, background: C.bg, fontFamily: 'monospace' }}>
                {form.slug || <span style={{ color: C.textLight, fontFamily: 'inherit', fontStyle: 'italic' }}>gerado automaticamente</span>}
              </div>
            </div>
            <Input label="Ordem" value={form.sortOrder} onChange={v => setForm(f => ({ ...f, sortOrder: v }))} placeholder="1" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Categoria'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

function SupplyCategoriesTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const { data: categories = [] } = useQuery<SupplyCategoryDto[]>({ queryKey: ['supply-categories'], queryFn: async () => (await api.get('/supply-categories')).data })
  const filtered = categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))

  const emptyForm = { name: '', slug: '', icon: '📦', sortOrder: '' }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openNew() { setForm(emptyForm); setEditing(null); setModal(true) }
  function openEdit(c: SupplyCategoryDto) {
    setForm({ name: c.name, slug: c.slug, icon: c.icon, sortOrder: String(c.sortOrder) })
    setEditing(c.id); setModal(true)
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 }
      return editing ? api.put(`/supply-categories/${editing}`, payload) : api.post('/supply-categories', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supply-categories'] })
      qc.invalidateQueries({ queryKey: ['supplies'] })
      setModal(false)
      showToast(editing ? '✅ Categoria atualizada' : '✅ Categoria criada')
    },
  })

  return (
    <>
      <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn onClick={openNew} size="sm" icon="➕">Nova Categoria</Btn>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg, position: 'sticky', top: 0 }}>
                {['Ícone', 'Nome', 'Slug', 'Ordem', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 16px', fontSize: 22 }}>{c.icon}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 600, color: C.text }}>{c.name}</td>
                  <td style={{ padding: '10px 16px' }}><code style={{ fontSize: 12, background: C.bg, padding: '2px 6px', borderRadius: 4, color: C.textMid }}>{c.slug}</code></td>
                  <td style={{ padding: '10px 16px', color: C.textMid }}>{c.sortOrder}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => openEdit(c)} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text }}>Editar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5}><Empty icon="🧂" msg="Nenhuma categoria encontrada" /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>{filtered.length} categoria{filtered.length !== 1 ? 's' : ''}</div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Categoria' : 'Nova Categoria de Insumo'} width={440}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <IconPicker value={form.icon} onChange={v => setForm(f => ({ ...f, icon: v }))} />
            <Input label="Nome" value={form.name} onChange={v => setForm(f => ({ ...f, name: v, slug: editing ? f.slug : toSlug(v) }))} placeholder="Ex: Carnes" autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Slug</label>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 14, color: C.textLight, background: C.bg, fontFamily: 'monospace' }}>
                {form.slug || <span style={{ color: C.textLight, fontFamily: 'inherit', fontStyle: 'italic' }}>gerado automaticamente</span>}
              </div>
            </div>
            <Input label="Ordem" value={form.sortOrder} onChange={v => setForm(f => ({ ...f, sortOrder: v }))} placeholder="1" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Categoria'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Unidades ──────────────────────────────────────────────────────────────────

interface UnitDto { id: string; name: string; label: string; sortOrder: number }

function UnitsTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const { data: units = [] } = useQuery<UnitDto[]>({ queryKey: ['units'], queryFn: async () => (await api.get('/units')).data })
  const filtered = units.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.label.toLowerCase().includes(search.toLowerCase()))

  const emptyForm = { name: '', label: '', sortOrder: '' }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  function openNew() { setForm(emptyForm); setEditing(null); setModal(true) }
  function openEdit(u: UnitDto) {
    setForm({ name: u.name, label: u.label, sortOrder: String(u.sortOrder) })
    setEditing(u.id); setModal(true)
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 }
      return editing ? api.put(`/units/${editing}`, payload) : api.post('/units', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units'] })
      setModal(false)
      showToast(editing ? '✅ Unidade atualizada' : '✅ Unidade criada')
    },
  })

  return (
    <>
      <Card style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn onClick={openNew} size="sm" icon="➕">Nova Unidade</Btn>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg, position: 'sticky', top: 0 }}>
                {['Sigla', 'Descrição', 'Ordem', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 16px' }}>
                    <code style={{ fontSize: 14, fontWeight: 800, background: C.amberLight, color: C.amber, padding: '3px 10px', borderRadius: 6 }}>{u.name}</code>
                  </td>
                  <td style={{ padding: '10px 16px', color: C.text }}>{u.label}</td>
                  <td style={{ padding: '10px 16px', color: C.textMid }}>{u.sortOrder}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <button onClick={() => openEdit(u)} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text }}>Editar</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={4}><Empty icon="📐" msg="Nenhuma unidade encontrada" /></td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>{filtered.length} unidade{filtered.length !== 1 ? 's' : ''}</div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Unidade' : 'Nova Unidade'} width={400}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
            <Input label="Sigla" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="kg" autoFocus />
            <Input label="Descrição" value={form.label} onChange={v => setForm(f => ({ ...f, label: v }))} placeholder="Quilograma" />
          </div>
          <Input label="Ordem de exibição" value={form.sortOrder} onChange={v => setForm(f => ({ ...f, sortOrder: v }))} placeholder="1" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.label}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Unidade'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Usuários ──────────────────────────────────────────────────────────────────

function UsersTab({ search, showToast }: { search: string; showToast: (m: string, t?: string) => void }) {
  const qc = useQueryClient()
  const { data: users = [] } = useQuery<UserDto[]>({ queryKey: ['users'], queryFn: async () => (await api.get('/users')).data })
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))

  const emptyUser = { name: '', email: '', password: '', role: 'Waiter', permissions: [] as string[], isActive: true }
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyUser)

  function openNew() { setForm(emptyUser); setEditing(null); setModal(true) }
  function openEdit(u: UserDto) {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, permissions: [...u.permissions], isActive: u.isActive })
    setEditing(u.id); setModal(true)
  }

  function togglePerm(p: string) {
    setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p] }))
  }

  function applyRolePreset(role: string) {
    setForm(f => ({ ...f, role, permissions: ROLE_PERMISSIONS[role] ?? [] }))
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { name: form.name, email: form.email, role: form.role, permissions: form.permissions, isActive: form.isActive, ...(form.password ? { password: form.password } : {}) }
      return editing ? api.put(`/users/${editing}`, payload) : api.post('/users', { ...payload, password: form.password })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setModal(false)
      showToast(editing ? '✅ Usuário atualizado' : '✅ Usuário criado')
    },
  })

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <>
      <Card style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
          <Btn onClick={openNew} size="sm" icon="➕">Novo Usuário</Btn>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: C.bg, position: 'sticky', top: 0 }}>
                {['Usuário', 'Perfil', 'Permissões', 'Ativo', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: '.5px', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const rc = roleColors[u.role] ?? { bg: C.bg, text: C.textMid }
                return (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: u.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: rc.bg, color: rc.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: C.text }}>{u.name}</div>
                          <div style={{ fontSize: 12, color: C.textMid }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px' }}><Badge color={rc.bg} textColor={rc.text}>{u.role}</Badge></td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.permissions.map(p => (
                          <span key={p} style={{ fontSize: 11, background: C.bg, color: C.textMid, borderRadius: 4, padding: '2px 6px', border: `1px solid ${C.border}` }}>{p}</span>
                        ))}
                        {u.permissions.length === 0 && <span style={{ color: C.textLight, fontSize: 13 }}>Sem acesso</span>}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', textAlign: 'center' }}>{u.isActive ? '✅' : '❌'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(u)} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: C.text }}>Editar</button>
                        <button onClick={() => toggle.mutate(u.id)} style={{ border: 'none', background: u.isActive ? C.dangerBg : C.successBg, borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: u.isActive ? C.danger : C.success, fontWeight: 600 }}>{u.isActive ? 'Desativar' : 'Ativar'}</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && <tr><td colSpan={5}><Empty icon="👥" msg="Nenhum usuário encontrado" /></td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar Usuário' : 'Novo Usuário'} width={560}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Nome" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Nome completo" autoFocus />
            <Input label="E-mail" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="email@exemplo.com" />
          </div>
          <Input label={editing ? 'Nova senha (deixe vazio para manter)' : 'Senha'} value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} type="password" placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'} />

          {/* Role presets */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMid, marginBottom: 8 }}>Perfil e permissões</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {ROLES.map(r => (
                <button key={r.value} onClick={() => applyRolePreset(r.value)} style={{ border: `1px solid ${form.role === r.value ? C.amber : C.border}`, background: form.role === r.value ? C.amberLight : C.surface, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: form.role === r.value ? C.amber : C.textMid }}>{r.label}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ALL_PERMISSIONS.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${form.permissions.includes(p.id) ? C.amber : C.border}`, background: form.permissions.includes(p.id) ? C.amberLight + '66' : C.bg, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.permissions.includes(p.id)} onChange={() => togglePerm(p.id)} style={{ width: 15, height: 15, marginTop: 1, cursor: 'pointer', accentColor: C.amber, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: C.textMid }}>{p.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
            <Btn onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.email || (!editing && !form.password)}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar Usuário'}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  )
}
