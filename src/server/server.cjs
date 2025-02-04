const WebSocket = require('ws')

const websocketConfig = [
  {
    type: 'A',
    frequency: 2000,
    stability: 1.0,
    connection: new WebSocket.WebSocketServer({ noServer: true }),
  },
  {
    type: 'B',
    frequency: 4000,
    stability: 0.7,
    connection: new WebSocket.WebSocketServer({ noServer: true }),
  },
  {
    type: 'C',
    frequency: 5000,
    stability: 0.3,
    connection: new WebSocket.WebSocketServer({ noServer: true }),
  },
]

// store any interval from setInterval here
const intervals = {}

websocketConfig.forEach(({ type, frequency, stability, connection }) => {
  connection.on('connection', (ws) => {
    console.log(`Client connected to source ${type}`)
    if (intervals[type]) {
      clearInterval(intervals[type])
      delete intervals[type]
    }
    intervals[type] = setInterval(() => {
      if (Math.random() > stability) {
        console.log(`Sending corrupt message on Source ${type}`)
        ws.send('Corrupted data')
      } else {
        console.log(`Sending Message on Source ${type}`)
        const data = {
          value: Math.random(),
        }
        console.log({ data })
        ws.send(JSON.stringify(data))
      }
    }, frequency)
  })

  connection.on('close', () => {
    clearInterval(intervals[type])
    console.log(`Client disconnected from Source ${type}`)
  })
})

const http = require('http')
const server = http.createServer()
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url
  const acceptedPaths = websocketConfig.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.type]: { route: `/${curr.type}`, connection: curr.connection },
    }),
    {},
  )

  switch (pathname) {
    case acceptedPaths.A.route:
      acceptedPaths.A.connection.handleUpgrade(request, socket, head, (ws) => {
        acceptedPaths.A.connection.emit('connection', ws, request)
      })
      break
    case acceptedPaths.B.route:
      acceptedPaths.B.connection.handleUpgrade(request, socket, head, (ws) => {
        acceptedPaths.B.connection.emit('connection', ws, request)
      })
      break
    case acceptedPaths.C.route:
      acceptedPaths.C.connection.handleUpgrade(request, socket, head, (ws) => {
        acceptedPaths.C.connection.emit('connection', ws, request)
      })
      break
    default:
      socket.destroy()
  }
})

server.listen(8080, () => {
  console.log('Websocket server running on localhost:8080')
  websocketConfig.forEach((definition) =>
    console.log(
      `Source ${definition.type}: ws://localhost:8080/${definition.type}`,
    ),
  )
})
