'use strict'

const spider = new (require('../spider'))

spider.on('ensureHash', (hash, addr)=> console.log(`magnet:?xt=urn:btih:${hash}`))

spider.on('unensureHash', (hash)=> console.log(hash))

spider.listen(2412)