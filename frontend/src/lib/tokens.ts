export const C = {
  amber:     '#E8920A',
  amberLight:'#FFF4E0',
  brown:     '#2D1A0E',
  brownMid:  '#5C3317',
  cream:     '#FAFAF8',
  bg:        '#F4F3F0',
  surface:   '#FFFFFF',
  border:    '#E8E5DF',
  text:      '#1A1208',
  textMid:   '#6B5B4E',
  textLight: '#9E8E80',
  success:   '#16A34A',
  successBg: '#DCFCE7',
  warn:      '#D97706',
  warnBg:    '#FEF3C7',
  danger:    '#DC2626',
  dangerBg:  '#FEE2E2',
  info:      '#2563EB',
  infoBg:    '#DBEAFE',
} as const

export const roleColors: Record<string, { bg: string; text: string }> = {
  Admin:   { bg: '#EDE9FE', text: '#5B21B6' },
  Manager: { bg: '#DBEAFE', text: '#1D4ED8' },
  Waiter:  { bg: '#DCFCE7', text: '#15803D' },
  Kitchen: { bg: '#FEF3C7', text: '#92400E' },
}

export const tableStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  Available:     { bg: C.successBg, text: C.success, label: 'Livre' },
  Occupied:      { bg: C.warnBg,    text: C.warn,    label: 'Ocupada' },
  BillRequested: { bg: C.dangerBg,  text: C.danger,  label: 'Conta pedida' },
}

export const orderStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  Open:      { bg: C.warnBg,    text: C.warn,    label: 'Aberto' },
  Closed:    { bg: C.successBg, text: C.success, label: 'Fechado' },
  Cancelled: { bg: C.dangerBg,  text: C.danger,  label: 'Cancelado' },
}

export const orderItemStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  Pending:   { bg: '#FEF3C7', text: '#92400E', label: 'Aguardando' },
  Preparing: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Preparando' },
  Ready:     { bg: C.successBg, text: C.success, label: 'Pronto' },
  Delivered: { bg: '#F3F4F6', text: '#6B7280', label: 'Entregue' },
}
