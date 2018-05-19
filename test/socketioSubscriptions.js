import test from 'ava'
import io from 'socket.io-client'

test.beforeEach(t => {
  const Database = require('@living-room/database-js')
  const room = new Database()

  const socketService = require('../src/services/socketio').create(
    room.client('socket'),
    { app: require('../src/services/httpserver'), verbose: false }
  )
  t.context.timesChanged = 0
})

test.cb('subscriptions in browser', t => {
  const socket = io.connect(`http://localhost:3000`)

  const gorogstart = 'gorog is at 0.5, 0.7'
  const gorogmove = 'gorog is at 0.8, 0.4'
  const gorogstartparsed = {name: {word: "gorog"}, x: {value: 0.5}, y:{value: 0.7}}
  const gorogmoveparsed = {name: {word: "gorog"}, x: {value: 0.8}, y:{value: 0.4}}

  const initialselections = JSON.stringify(['$name is at $x, $y'])

  socket.on(initialselections, ({assertions, retractions}) => {
    if (t.context.timesChanged === 0) {
      t.deepEqual([gorogstartparsed], assertions, "asserted:gorogstart:previousassertions")
      t.deepEqual([], retractions, "asserted:gorogstart:previousretractions")
      t.end()
      // FIXME: this never gets called...
    } else if (t.context.timesChanged === 1) {
      t.deepEqual([gorogmoveparsed], assertions, "asserted:gorogmove:assertions")
      t.deepEqual([], retractions, "asserted:gorogmove:retractions")
    }
    t.context.timesChanged++
  })

  setTimeout(() => socket.emit('assert', [gorogstart]), 10)
  setTimeout(() => socket.emit('subscribe', initialselections), 50)
})