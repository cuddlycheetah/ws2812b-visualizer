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

var lgbt = [
];

for (let i=0;i < 10; i++) {
    let newPattern = []
    for (let j=0;j < rand(0,5);j++)
        newPattern.push(rand(0, 64) * 4)
    lgbt.push(newPattern)
}


//const net = require('net')

function send(cmd) {
    let msg = new Buffer(cmd, 'hex')
    client.send(msg, 0, msg.length, PORT, HOST)
}
function rand(min, max) {
    return min + Math.floor(Math.random() * max)
}
//dynamicRainbow(1)
/*
setInterval(() => {
    let first = rand(0, lgbt.length)
    //if (first == 0)
    //    send([0xff]);
   // else {
        lgbtPattern = lgbt[first]

        patt = [0x04, lgbtPattern.length]
        patt = patt.concat(lgbtPattern)
        patt = patt.concat([
            ((rand(0,2) * 10) + rand(0,2)),
             rand(0, 100)
        ])
        send(patt)
        console.log(patt)
   // }
}, 8) // Interval: 8-10ms
*/
