
let JsonSocket = require('json-socket')
let EventEmitter = require('events')

let net = require('net')

const DEFAULT_PORT = 1337
const DEFAULT_ADDR = '127.0.0.1'

class MessageFormatter {

	constructor (event) {
		this.setEvent(event)
	}

	format (data) {
		return {
			type: this.event,
			data: data
		}
	}

	setEvent (event) {
		this.event = event
	}

}

class StreamClient extends EventEmitter {

	constructor ({port, host} = {}) {
		super()

			this.port = port ? port : DEFAULT_PORT
			this.host = host ? host : DEFAULT_ADDR

			this.socket = new JsonSocket(new net.Socket())

			this._connect()
	}

	_connect () {
		this.connection = this.socket.connect(this.port, this.host)

			this._listen()
	}

	_listen () {
		this.connection.on('message', message => {

			console.log(message)

			if (message.type == 'error') {
				return this._onError(message.data)
			}

		return this._onMessage(message.data)
		})
	}

	_onError (err) {
		this.emit('err', err)
	}

	_onMessage (message) {
		this.emit('message', message)
	}

	add (magnet) {
		this.write('torrent.add', {magnet})
	}

	write (type, data) {
		let pre = new MessageFormatter(type)

			let request = pre.format(data)

			this._send(request)
	}

	_send (request) {
		this.connection.sendMessage(request)
	}

}

/*let client = new StreamClient()

	client.add('magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=sintel.mp4&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel-1024-surround.mp4')

client.on('message', console.log);
*/
module.exports = StreamClient
