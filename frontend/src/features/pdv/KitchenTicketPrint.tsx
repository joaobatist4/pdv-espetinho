import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ordersService } from '../../services/orders.service'
import { fmtTime } from '../../lib/utils'

interface Props {
  orderId: string
  onClose: () => void
}

export default function KitchenTicketPrint({ orderId, onClose }: Props) {
  const printed = useRef(false)

  const { data: ticket } = useQuery({
    queryKey: ['kitchen-ticket', orderId],
    queryFn: () => ordersService.getKitchenTicket(orderId),
  })

  useEffect(() => {
    if (ticket && !printed.current) {
      printed.current = true
      setTimeout(() => {
        window.print()
        onClose()
      }, 300)
    }
  }, [ticket])

  if (!ticket) return null

  return (
    <div className="print-area hidden print:block">
      <div className="text-center font-bold text-base mb-2">🍢 COMANDA COZINHA</div>
      <div className="text-center text-sm mb-1">{ticket.tableLabel}</div>
      <div className="text-center text-xs mb-3">{fmtTime(ticket.openedAt)}</div>
      <div className="border-t border-dashed border-black mb-2" />
      {ticket.items.map((item, i) => (
        <div key={i} className="flex justify-between text-sm mb-1">
          <span>{item.productName}</span>
          <span className="font-bold">x{item.quantity}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-black mt-2" />
    </div>
  )
}
