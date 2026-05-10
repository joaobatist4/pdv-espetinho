import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '../stores/auth.store'

interface KitchenEvents {
  onNewOrder?: (payload: { orderId: string; tableId: string }) => void
  onItemStatusChanged?: (payload: { orderId: string; itemId: string; newStatus: string }) => void
}

export function useKitchenHub({ onNewOrder, onItemStatusChanged }: KitchenEvents) {
  const token = useAuthStore((s) => s.token)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/kitchen', {
        accessTokenFactory: () => token ?? '',
      })
      .withAutomaticReconnect()
      .build()

    if (onNewOrder) connection.on('NewOrder', onNewOrder)
    if (onItemStatusChanged) connection.on('ItemStatusChanged', onItemStatusChanged)

    connection
      .start()
      .then(() => connection.invoke('JoinKitchen'))
      .catch(console.error)

    connectionRef.current = connection

    return () => {
      connection.stop()
    }
  }, [])

  return connectionRef
}
