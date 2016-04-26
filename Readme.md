# Nodejs DHT infohash spider


#### for [engiy.com](http://engiy.com)


# install
```javascript
npm install dhtspider
```


# Useage
```javascript
'use strict'
const spider = new (require('dhtspider'))
spider.on('ensureHash', (hash, addr)=> {console.log(hash)})
spider.lisen(6339)
```