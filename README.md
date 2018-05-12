
Tika-Server
===========

Apache Tika Server as a Background Service in Node.js

<p/>
<img src="https://nodei.co/npm/tika-server.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/tika-server.png" alt=""/>

About
-----

This is a small JavaScript library for use in Node.js environments,
providing the possibility to run Apache Tika Server as a local
background service and query it through a frontend JavaScript API.

Installation
------------

```shell
$ npm install tika-server
```

Usage
-----

```
const TikaServer = require("tika-server")

;(async () => {
    const ts = new TikaServer()
    ts.on("debug", (msg) => {
        console.log(`DEBUG: ${msg}`)
    })
    await ts.start()
    await ts.queryText("foo").then((data) => {
        console.log(data)
    })
    await ts.stop()
})().catch((err) => {
    console.log(`ERROR: ${err}`)
})
```

Motivation
----------

The major differences to similar NPM modules and the motivation for the existence of Tika-Server are:

1. Tika-Server, in contrast to the [tika](http://npmjs.com/tika) module,
   does not depend on the native [java](http://npmjs.com/java) module.
   Instead, it just requires the `java` executable to be available.

2. Tika-Server, in contrast to the [tika](http://npmjs.com/tika) module,
   does not spawn Apache Tika for every query.
   Instead, it uses a continuously running Apache Tika Server in a background process.

3. Tika-Server, in contrast to the [tika](http://npmjs.com/tika) module,
   does not ship with an old Tika JAR.
   Instead, it automatically downloads and uses a more recent one.

4. Tika-Server, in contrast to the [tika-server-client](http://npmjs.com/tika-server-client) module,
   does not need a pre-installed Apache Tika Server.
   Instead, it automatically starts and stops a local instance of it in the background.

5. Tika-Server, in contrast to the [tika-text-extract](http://npmjs.com/tika-text-extract) module,
   does not use the hard-coded (default) TCP/IP port 9998 for the background Apache Tika Server process.
   Instead, it automatically determines and uses a free TCP/IP port on localhost.

License
-------

Copyright (c) 2018 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

