'use strict'

const spider = new (require('../lib/spider'))

spider.on('ensureHash', (hash, addr)=> console.log(`magnet:?xt=urn:btih:${hash}`))

spider.on('unensureHash', (hash)=> console.log(hash))

// spider.on('nodes', (nodes)=>console.log('foundNodes'))

spider.listen(6339)