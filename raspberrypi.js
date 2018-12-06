const dgram = require('dgram')

const HOST1 = '192.168.1.220'
const HOST2 = '192.168.1.221'

const HOST = '192.168.1.255'
const PORT = 666

const client = new dgram.createSocket('udp4')
client.bind( function() { client.setBroadcast(true) } )




const server = require('http').createServer();
const io = require('socket.io')(server)
io.on('connect', function(cl){
  console.log('connected')
  send([ 0x06, 255, 0, 0 ])
  cl.on('beat', (r,g,b) => {
    send([ 0x06, r, g, b ])
  })
})

send([ 0x06, 255, 255, 255 ])


server.listen(5563)

function send(cmd) {
    let msg = new Buffer(cmd, 'hex')
    client.send(msg, 0, msg.length, PORT, HOST)
}
function rand(min, max) {
    return min + Math.floor(Math.random() * max)
}
