// ~ WEBSOCKET THINGS ~

let id = null
// const ws_address = `wss://capogreco-ds-asweat.deno.dev/`
const ws_address = `ws://localhost/`

const socket = new WebSocket (ws_address)

socket.addEventListener (`message`, msg => {
   const obj = JSON.parse (msg.data)
   switch (obj.type) {
      case 'id':
         id = obj.body
         console.log (`identity is ${ id }`)
         const greeting = {
            type: `greeting`,
            body: `${ id } ~> hello!`
         }
         socket.send (JSON.stringify (greeting))      
         break
      case 'play':
         active = obj.body
         const mult = active ? 1 : 0
         const t = audio_context.currentTime
         amp.gain.setValueAtTime (amp.gain.value, t)
         amp.gain.linearRampToValueAtTime (1 * mult, t + 2)
         break

   }
})

socket.addEventListener ('open', msg => {
   console.log (`websocket is ${ msg.type } at ${ msg.target.url } `)
})

// ~ UI THINGS ~

document.body.style.margin   = 0
document.body.style.overflow = `hidden`

document.body.style.backgroundColor = `black`
const text_div                = document.createElement (`div`)
text_div.innerText            = `tap to join`
text_div.style.font           = `italic bolder 80px sans-serif`
text_div.style.color          = `white`
text_div.style.display        = `flex`
text_div.style.justifyContent = `center`
text_div.style.alignItems     = `center`
text_div.style.position       = `fixed`
text_div.style.width          = `${ window.innerWidth }px`
text_div.style.height         = `${ window.innerHeight }px`
text_div.style.left           = 0
text_div.style.top            = 0
document.body.appendChild (text_div)

document.body.onclick = async () => {
   if (document.body.style.backgroundColor == `black`) {

      await audio_context.resume ()

      document.body.style.backgroundColor = `deeppink`
      text_div.remove ()

      const msg = {
         type: 'joined',
         body: true,
      }
      socket.send (JSON.stringify (msg))   
   }
}

// ~ WEB AUDIO THINGS ~

let active = false


const audio_context = new AudioContext ()
audio_context.suspend ()

const lfo = audio_context.createOscillator ()
lfo.type  = `sine`
lfo.frequency.value = 0

const wid = audio_context.createGain ()

const osc = audio_context.createOscillator ()
osc.type  = `triangle`
osc.frequency.value = 220

const amp = audio_context.createGain ()
amp.gain.value = 0

lfo.connect (wid)
   .connect (osc.frequency)

osc.connect (amp)
   .connect (audio_context.destination)

lfo.start ()
osc.start ()


