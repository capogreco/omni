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
let total_pressed = []

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

class ChordSelector {
   constructor (root, key_array) {
      this.root    = root
      this.keys    = key_array
      this.acc     = 0
      this.pressed = [ 0, 0, 0 ]
      this.chords  = [
         [ 0, 4, 7 ],
         [ 0, 3, 7 ],
         [ 0, 3, 6, 9 ],
         [ 0, 4, 7, 10 ],
         [ 0, 4, 7, 11 ],
         [ 0, 3, 7, 10 ],
         [ 0, 3, 6, 10 ],
      ]
   }

   press (key) {
      const i = this.keys.indexOf (key)

      if (i == -1) return

      this.pressed[i] = 1

      this.acc += 2 ** i
   }

   unpress (key) {
      const i = this.keys.indexOf (key)

      if (i == -1) return

      this.pressed[i] = 0

      if (this.acc && this.pressed.reduce ((a, v) => a + v) == 0) {
         const chord = []
         this.chords[this.acc - 1].forEach (n => {
            chord.push (this.root + n)
         })
         this.acc = 0
         return chord
      }
      else return false
   }
}

const omni_chord = []

omni_chord.push (new ChordSelector (61, [ '1', 'q', 'a'  ])) // Db4
omni_chord.push (new ChordSelector (68, [ '2', 'w', 's'  ])) // Ab4
omni_chord.push (new ChordSelector (63, [ '3', 'e', 'd'  ])) // Eb4
omni_chord.push (new ChordSelector (70, [ '4', 'r', 'f'  ])) // Bb4
omni_chord.push (new ChordSelector (65, [ '5', 't', 'g'  ])) // F4
omni_chord.push (new ChordSelector (60, [ '6', 'y', 'h'  ])) // C4
omni_chord.push (new ChordSelector (67, [ '7', 'u', 'j'  ])) // G4
omni_chord.push (new ChordSelector (62, [ '8', 'i', 'k'  ])) // D4
omni_chord.push (new ChordSelector (69, [ '9', 'o', 'l'  ])) // A4
omni_chord.push (new ChordSelector (64, [ '0', 'p', ';'  ])) // E4
omni_chord.push (new ChordSelector (71, [ '-', '[', `'`  ])) // B4
omni_chord.push (new ChordSelector (66, [ '=', ']', `\\` ])) // F#4

document.body.onkeydown = e => {
   if (total_pressed.indexOf (e.key) != -1) return

   total_pressed.push (e.key)

   switch (e.key) {
      case 'Enter':
         active = !active
         const msg = {
            type: 'play',
            body: active
         }
         socket.send (JSON.stringify (msg))
         return
   }

   omni_chord.forEach (s => {
      s.press (e.key)
   })
}

document.body.onkeyup = e => {
   const i = total_pressed.indexOf (e.key)
   total_pressed.splice (i, 1)

   omni_chord.forEach (s => {
      const chord = s.unpress (e.key)
      if (chord) {
         const msg = {
            type: `chord`,
            body: chord
         }
         socket.send (JSON.stringify (msg))
      }
   })
}
