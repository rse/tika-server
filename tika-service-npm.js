/*
**  Tika-Service -- Apache Tika Server as a Background Service
**  Copyright (c) 2018 Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  eslint no-console: off */

/*  core requirements  */
var childProcess  = require("child_process")
var fs            = require("fs")
var path          = require("path")

/*  extra requirements  */
var sprintf       = require("sprintfjs")
var request       = require("request")
var rimraf        = require("rimraf")

/*  download data from URL  */
var downloadData = (url) => {
    return new Promise((resolve, reject) => {
        var options = {
            method: "GET",
            url: url,
            encoding: null,
            headers: {
                "User-Agent": "NPM/Tika-Service (tika-service-npm.js)"
            }
        }
        ;(new Promise((resolve /*, reject  */) => {
            if (typeof process.env.http_proxy === "string" && process.env.http_proxy !== "") {
                options.proxy = process.env.http_proxy
                console.log(`-- using proxy ($http_proxy): ${options.proxy}`)
                resolve()
            }
            else {
                childProcess.exec("npm config get proxy", (error, stdout /*, stderr */) => {
                    if (error === null) {
                        stdout = stdout.toString().replace(/\r?\n$/, "")
                        if (stdout.match(/^https?:\/\/.+/)) {
                            options.proxy = stdout
                            console.log(`-- using proxy (npm config get proxy): ${options.proxy}`)
                        }
                    }
                    resolve()
                })
            }
        })).then(() => {
            console.log(`-- download: ${url}`)
            var filesize = (size) => {
                return sprintf("%d", size)
                    .replace(/(\d+)(\d{3})(\d{3})$/, "$1.$2.$3")
                    .replace(/(\d+)(\d{3})$/, "$1.$2")
            }
            var req = request(options, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    process.stdout.write(`\r-- download: ${filesize(body.length)} bytes received.     \n`)
                    resolve(body)
                }
                else
                    reject(new Error(`download failed: ${error}`))
            })
            var len = 0
            req.on("response", (response) => {
            })
            req.on("data", (data) => {
                len += data.length
                process.stdout.write(sprintf("\r-- download: %10s bytes received... ", filesize(len)))
            })
        })
    })
}

/*  common configuration  */
var srcurl   = "http://www.apache.org/dist/tika/tika-server-1.18.jar"
var destfile = path.join(__dirname, "tika-service-cli.jar")

/*  main procedure  */
if (process.argv.length !== 3) {
    console.log("ERROR: invalid number of arguments")
    process.exit(1)
}
if (process.argv[2] === "install") {
    /*  installation procedure  */
    if (!fs.existsSync(destfile)) {
        console.log("++ fetching external Apache Tika server distribution JAR file")
        downloadData(srcurl).then((data) => {
            fs.writeFileSync(destfile, data, { encoding: null })
            console.log("-- OK: done")
        }).catch((error) => {
            console.log(`** ERROR: failed to download: ${error}`)
        })
    }
}
else if (process.argv[2] === "uninstall") {
    /*  uninstallation procedure  */
    if (fs.existsSync(destfile)) {
        console.log("++ deleting local copy of external Apache Tika server distribution JAR file")
        rimraf(destfile, (error) => {
            if (error !== null)
                console.log(`** ERROR: ${error}`)
            else
                console.log("-- OK: done")
        })
    }
}
else {
    console.log("ERROR: invalid argument")
    process.exit(1)
}

