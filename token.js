'use strict'

module.exports = class {
	constructor() {
		this.token = new Buffer([parseInt(Math.random()*200), parseInt(Math.random()*200)])
		setInterval(()=>{
			this.token = new Buffer([parseInt(Math.random()*200), parseInt(Math.random()*200)])
		}, 60000*15)
	}

	isValid(t) {
		console.log(this.token, t)
		return t.toString() === this.token.toString()
	}
}