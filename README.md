# patatracker-parser
[Pata-Tracker](https://cstoquer.itch.io/pata-tracker) file format parser and encoder.

## Parse Pata-Tracker JSON data

```js
var parser = require('patatracker-parser');
var album = parser(data);
```

## Serialize Album to JSON

```js
require('patatracker-parser/src/serialize');
var data = album.serialize();
```
