'use strict'

const crypto = require('crypto')

class Node {
	static generateID() {
		return crypto.createHash('sha1').update(`${(new Date).getTime()}:${Math.random()*99999}`).digest()
	}

	constructor(id) {
		this.id = id || Node.generateNodeID()
	}

	static neighbor(target, id) {
		return Buffer.concat([target.slice(0, 10), id.slice(10)])
	}

	static decodeNodes(data) {
		const nodes = []
		for (let i = 0; i + 26 <= data.length; i += 26) {
			nodes.push({
				id: data.slice(i, i + 20),
				address: `${data[i + 20]}.${data[i + 21]}.${data[i + 22]}.${data[i + 23]}`,
				port: data.readUInt16BE(i + 24)
			})
		}
		return nodes
	}
}

exports.Table = class {
	constructor(cap) {
		this.id = Node.generateID()
		this.nodes = []
		this.caption = cap
	}
	add(node) {
		if (this.nodes.length < this.caption) {
			this.nodes.push(node)
		}
	}
	shift() {
		return this.nodes.shift()
	}
}

exports.Node = Node