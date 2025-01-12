import { vi } from 'vitest'

// Mock implementation of WebSocket
class MockWebSocket {
  public url: string
  public readyState: number = 0 // CONNECTING
  public onopen: (() => void) | null = null
  public onmessage: ((event: { data: any }) => void) | null = null
  public onclose: ((event: { code: number; reason: string }) => void) | null =
    null
  public onerror: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    setTimeout(() => {
      this.readyState = 1 // OPEN
      this.onopen?.()
    }, 10) // Simulate async connection
  }

  send = vi.fn((data: any) => {
    console.log(`MockWebSocket sent: ${data}`)
  })

  close = vi.fn((code = 1000, reason = 'Normal closure') => {
    this.readyState = 3 // CLOSED
    this.onclose?.({ code, reason })
  })

  // Utility methods to simulate events
  triggerOpen() {
    this.onopen?.()
  }

  triggerMessage(data: any) {
    this.onmessage?.({ data })
  }

  triggerClose(code: number, reason: string) {
    this.readyState = 3
    this.onclose?.({ code, reason })
  }

  triggerError() {
    this.onerror?.()
  }
}

export default MockWebSocket
