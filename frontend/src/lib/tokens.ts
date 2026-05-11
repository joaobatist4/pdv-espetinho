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
  Admin:     { bg: '#EDE9FE', text: '#5B21B6' },
  Gerente:   { bg: '#DBEAFE', text: '#1D4ED8' },
  Garconete: { bg: '#DCFCE7', text: '#15803D' },
  Cozinha:   { bg: '#FEF3C7', text: '#92400E' },
}

export const tableStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  Livre:       { bg: C.successBg, text: C.success, label: 'Livre' },
  Ocupada:     { bg: C.warnBg,    text: C.warn,    label: 'Ocupada' },
  ContaPedida: { bg: C.dangerBg,  text: C.danger,  label: 'Conta pedida' },
}

export const orderStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  Aberto:    { bg: C.warnBg,    text: C.warn,    label: 'Aberto' },
  Fechado:   { bg: C.successBg, text: C.success, label: 'Fechado' },
  Cancelado: { bg: C.dangerBg,  text: C.danger,  label: 'Cancelado' },
}

export const orderItemStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  Aguardando: { bg: '#FEF3C7', text: '#92400E', label: 'Aguardando' },
  Preparando: { bg: '#DBEAFE', text: '#1D4ED8', label: 'Preparando' },
  Pronto:     { bg: C.successBg, text: C.success, label: 'Pronto' },
  Entregue:   { bg: '#F3F4F6', text: '#6B7280', label: 'Entregue' },
}
