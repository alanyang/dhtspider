'use strict'

const dgram = require('dgram')
const EventEmitter = require('events')
const bencode = require('bencode')
const t = require('./table')
const Token = require('./token')

const Table = t.Table
const Node = t.Node

const bootstraps = [{
    address: 'router.bittorrent.com',
    port: 6881
}, {
    address: 'dht.transmissionbt.com',
    port: 6881
}]

const tableCaption = 400

function isValidPort(port) {
    return port > 0 && port < (1 << 16)
}

function generateTid() {
    return parseInt(Math.random() * 99).toString()
}

class Spider extends EventEmitter {
    constructor() {
        super()
        const options = arguments.length? arguments[0]: {}
        this.udp = dgram.createSocket('udp4')
        this.table = new Table(options.tableCaption || tableCaption)
        this.bootstraps = options.bootstraps || bootstraps
        this.token = new Token()
    }

    send(message, address) {
        const data = bencode.encode(message)
        this.udp.send(data, 0, data.length, address.port, address.address)
    }

    findNode(id, address) {
        const message = {
            t: generateTid(),
            y: 'q',
            q: 'find_node',
            a: {
                id: id,
                target: Node.generateID()
            }
        }
        this.send(message, address)
    }

    join() {
    	const id = Node.generateID()
        this.bootstraps.forEach((b) => {
            this.findNode(id, b)
        })
        this.table.id = id
    }

    walk() {
        this.table.nodes.forEach((node) => {
            this.findNode(Node.neighbor(node.id, this.table.id), {
                address: node.address,
                port: node.port
            })
        })
        this.table.nodes = []
    }

    onFoundNodes(data) {
        const nodes = Node.decodeNodes(data)
        nodes.forEach((node) => {
            if (node.address != this.address && node.id != this.table.id && isValidPort(node.port)) {
                this.table.add(node)
            }
        })
        this.emit('nodes', nodes)
    }

    onGetPeersRequest(message, address) {
        const infohash = message.a.info_hash
        const tid = message.t
        const nid = message.a.id

        if (tid === undefined || infohash.length != 20 || nid.length != 20) {
            return
        }

        this.send({
            t: tid,
            y: 'r',
            r: {
                id: Node.neighbor(infohash, this.table.id),
                nodes: '',
                token: this.token.token
            }
        }, address)

        this.emit('unensureHash', infohash.toString('hex').toUpperCase())
    }

    onAnnouncePeerRequest(message, address) {
    	console.log(message)
        const infohash = message.a.info_hash
        const token = message.a.token
        const id = message.a.id
        const tid = message.t
        if (!tid) return

        if (!this.token.isValid(token)) return
       
        const port = (message.a.implied_port != undefined && msg.a.implied_port != 0) ? address.port : (message.a.port || 0)
        if (!isValidPort(port)) return

        this.send({
            t: tid,
            y: 'r',
            r: {
                id: Node.neighbor(id, this.table.id)
            }
        }, address)

    	this.emit('ensureHash', infohash.toString('hex').toUpperCase(), {
            address: address.address,
            port: port
        })
    }

    onPingRequest(message, addr) {
    	this.send({
    		t: message.t,
    		y: 'r',
    		r: {
    			id: Node.neighbor(message.a.id, this.table.id)
    		}
    	})
    }

    parse(data, address) {
        try {
            const message = bencode.decode(data)
            if (message.y.toString() == 'r' && message.r.nodes) {
                this.onFoundNodes(message.r.nodes)
            } else if (message.y.toString() == 'q') {
            	switch(message.q.toString()) {
            		case 'get_peers':
            		this.onGetPeersRequest(message, address)
            		break
            		case 'announce_peer':
            		this.onAnnouncePeerRequest(message, address)
            		break
            		case 'ping':
            		this.onPingRequest(message, address)
            		break
            	}
            }
        } catch (err) {}
    }

    listen(port) {
        this.udp.bind(port)
        this.udp.on('listening', () => {
            console.log(`Listen on ${this.udp.address().address}:${this.udp.address().port}`)
        })
        this.udp.on('message', (data, addr) => {
        	// console.log(data)
            this.parse(data, addr)
        })
        this.udp.on('error', (err) => {})
        setInterval(() => {
        	this.table.nodes.length? this.walk() : this.join()
        }, 1000)
    }
}

module.exports = Spider