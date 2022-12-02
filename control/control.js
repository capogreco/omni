// ~ WEBSOCKET THINGS ~

let id = null

// const ws_address = `wss://capogreco-ds-asweat.deno.dev/`
const ws_address = `ws://localhost/`

const socket = new WebSocket (ws_address)

socket.addEventListener (`message`, msg => {
   const obj = JSON.parse (msg.data)
   switch (obj.type) {
      case `id`:
         id = obj.body
         console.log (`identity is ${ id }`)
         const msg = {
            type: `request_control`,
            body: id,
         }
         socket.send (JSON.stringify (msg))
         break
      case `sockets`:
         socket_list.textContent = ``
         obj.body.forEach (e => {
            const div = document.createElement (`div`)
            div.innerText = e[0]
            div.style.width = `100%`
            div.style.color  = e[1].joined ? `white` : `grey`
            socket_list.appendChild (div)
         })
         break
   }
})

socket.addEventListener ('open', msg => {
   console.log (`websocket at ${ msg.target.url } is ${ msg.type }`)
})


// ~ UI THINGS ~

document.body.style.margin   = 0
document.body.style.overflow = `hidden`
document.body.style.backgroundColor = `indigo`

let active = false

document.body.onkeydown = e => {
   // console.log (e.key)
   switch (e.key) {
      case 'Enter':
         active = !active
         const msg = {
            type: 'play',
            body: active
         }
         socket.send (JSON.stringify (msg))
         break
   }
}

const socket_list                = document.createElement (`div`)
socket_list.style.font           = `14 px`
socket_list.style.fontFamily     = 'monospace'
socket_list.style.color          = `white`
socket_list.style.display        = `block`
socket_list.style.position       = `fixed`
socket_list.style.width          = `${ window.innerWidth }px`
socket_list.style.height         = `${ window.innerHeight }px`
socket_list.style.left           = 0
socket_list.style.top            = 0
document.body.appendChild (socket_list)
