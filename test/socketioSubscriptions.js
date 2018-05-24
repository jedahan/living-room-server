import test from 'ava'
import io from 'socket.io-client'
import pickPort from 'pick-port'

test.beforeEach(async t => {
  const Database = require('@living-room/database-js')
  const room = new Database()

  const SocketIOService = require('../src/services/socketio')
  const port = await pickPort()
  const socketservice = new SocketIOService({
    room: room.client('socketio'),
    port
  })
  t.context.app = await socketservice.listen()
  t.context.timesChanged = 0
})

test.cb('subscriptions in browser', t => {
  let { address, port, family } = t.context.app.address()
  const socket = io.connect(`http://[${address}]:${port}`)

  const gorogstart = 'gorog is at 0.5, 0.7'
  const gorogmove = 'gorog is at 0.8, 0.4'
  const gorogstartparsed = {name: {word: "gorog"}, x: {value: 0.5}, y:{value: 0.7}}
  const gorogmoveparsed = {name: {word: "gorog"}, x: {value: 0.8}, y:{value: 0.4}}

  const initialselections = JSON.stringify(['$name is at $x, $y'])

  socket.on(initialselections, data => {
    if (t.context.timesChanged === 0) {
      t.deepEqual([gorogstartparsed], data, "asserted:gorogstart:previousassertions")
      t.end()
      // FIXME: this never gets called...
    } else if (t.context.timesChanged === 1) {
      t.deepEqual([gorogmoveparsed], data, "asserted:gorogmove:assertions")
    }
    t.context.timesChanged++
  })

  setTimeout(() => socket.emit('assert', [gorogstart]), 10)
  setTimeout(() => socket.emit('subscribe', initialselections), 50)
})
