# Nodejs DHT infohash spider

develop for [engiy.com](http://engiy.com)(A bittorrent resource search engine)
Implements [DHT protocol](http://www.bittorrent.org/beps/bep_0005.html)

## requirement
Node.js 6.0+


## install
```javascript
npm install dhtspider
```


## Useage
```javascript
'use strict'

const spider = new (require('dhtspider'))

spider.on('ensureHash', (hash, addr)=> console.log(`magnet:?xt=urn:btih:${hash}`))

spider.listen(6339)
```

## API
### Class Spider(options)
#### options
##### tableCaption
default is 600, if your server have a lot memory, increasing this value can improve crawl efficiency
##### bootstraps
entry of dht network, default is
```javascript
[{ address: 'router.bittorrent.com', port: 6881}, {address: 'dht.transmissionbt.com',port: 6881}]
```

### method spider.listen(port)
start spider on port 

### events
##### 'unensureHash'
Got a unensured info hash, usually, there is no need to care.
##### 'nodes'
Got nodes, invoke on find_node success
##### 'ensureHash'
Got a ensured info hash, callback has two arguments, first is hex info hash, second is a tcp address {address: 'x.x.x.x', port: xxx} for fetch metainfo of the resource by [Extension for Peers to Send Metadata Files](http://www.bittorrent.org/beps/bep_0009.html)


#### Online Sample [Bittorrent resource search engine](http://engiy.com)


