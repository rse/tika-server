/*
**  Tika-Server -- Apache Tika Server as a Background Service
**  Copyright (c) 2018-2021 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

/*  internal requirements  */
const path           = require("path")
const childProcess   = require("child_process")

/*  external requirements  */
const which          = require("which")
const findFreePort   = require("find-free-port")
const EventEmitter   = require("eventemitter3")
const axios          = require("axios")

/*  the API class  */
class TikaServer extends EventEmitter {
    constructor (options = {}) {
        super()

        /*  determine options  */
        this.options = Object.assign({}, {
            javaBinary:   "java",
            javaOptions:  "-server -Xms1G -Xmx1G",
            tikaBinary:   path.join(__dirname, "tika-server-cli.jar"),
            tikaConfig:   path.join(__dirname, "tika-server-cli.xml"),
            tikaOptions:  "",
            tikaHost:     "127.0.0.1",
            tikaPortMin:  41000,
            tikaPortMax:  42000
        }, options)

        /*  initialize internal state  */
        this.proc = null
        this.port = 0
    }

    /*  start the Apache Tika Server service  */
    async start () {
        /*  sanity check usage  */
        if (this.proc !== null)
            throw new Error("Apache Tika Server process already running")

        /*  resolve path to Java binary  */
        const javaBinary = await new Promise((resolve, reject) => {
            which(this.options.javaBinary).then((filename) => {
                resolve(filename)
            }).catch((error) => {
                reject(new Error("unable to find mandatory Java binary " +
                    `"${this.options.javaBinary}" in your $PATH`))
            })
        })

        /*  determine free TCP/IP port  */
        this.port = await findFreePort(
            this.options.tikaPortMin, this.options.tikaPortMax,
            this.options.tikaHost)

        /*  spawn the Apache Tika Server process  */
        this.emit("tika-start")
        this.emit("debug", "tika: starting")
        this.proc = childProcess.spawn(javaBinary, [
            ...this.options.javaOptions.split(/\s+/),
            "-jar",     this.options.tikaBinary,
            ...this.options.tikaOptions.split(/\s+/),
            "--config", this.options.tikaConfig,
            "--host",   this.options.tikaHost,
            "--port",   this.port
        ], {})

        /*  detect shutdown of Apache Tika Server process  */
        this.proc.on("close", (code) => {
            this.emit("tika-close", code)
            this.emit("debug", `tika: close (code: ${code})`)
            this.proc = null
        })

        /*  pass-through stdout of Apache Tika Server process  */
        this.proc.stdout.on("data", (data) => {
            this.emit("tika-stdout", data)
            this.emit("debug", `tika: stdout: ${data.toString()})`)
        })

        /*  pass-through stderr of Apache Tika Server process
            and detect when it is finall ready to service requests  */
        return new Promise((resolve, reject) => {
            this.proc.stderr.on("data", (data) => {
                this.emit("tika-stderr", data)
                this.emit("debug", `tika: stderr: ${data.toString()})`)
                if (data.toString().match(/Started\s+Apache\s+Tika\s+server/)) {
                    this.emit("tika-started")
                    this.emit("debug", "tika: started")
                    resolve()
                }
            })
        })
    }

    /*  query the Apache Tika Server service  */
    async query (content, options = {}) {
        /*  sanity check usage  */
        if (this.proc === null)
            throw new Error("Apache Tika Server process not running")

        /*  determine options  */
        options = Object.assign({}, {
            endpoint:  "tika",
            type:      "application/octet-stream",
            accept:    "text/xml",
            response:  "blob",
            maxlength: 256 * 1024 * 1024,
            filename:  ""
        }, options)

        /*  query Apache Tika Server process via its HTTP interface  */
        const request = {
            method: "PUT",
            url:    `http://${this.options.tikaHost}:${this.port}/${options.endpoint}`,
            headers: {
                "Content-Type": options.type,
                Accept:         options.accept
            },
            data: content,
            responseType:     options.response,
            maxContentLength: options.maxlength
        }
        if (options.filename !== "") {
            const filename = path.basename(options.filename)
            request.headers["Content-Disposition"] = `attachment; filename=${filename}`
        }
        this.emit("tika-query-request", request)
        this.emit("debug", `tika: query: request=${JSON.stringify(request)}`)
        return axios(request).then((response) => {
            this.emit("tika-query-response", response.data)
            this.emit("debug", `tika: query: response=${JSON.stringify(response.data)}`)
            return response.data
        })
    }

    /*  query the Apache Tika Server service for meta information only  */
    async queryMeta (content, options = {}) {
        /*  determine options  */
        options = Object.assign({}, options, {
            endpoint: "meta",
            accept:   "application/json",
            response: "json"
        })

        /*  pass-through query  */
        return this.query(content, options)
    }

    /*  query the Apache Tika Server service for text extraction only  */
    async queryText (content, options = {}) {
        /*  determine options  */
        options = Object.assign({}, options, {
            endpoint: "tika",
            accept:   "text/plain",
            response: "text"
        })

        /*  pass-through query  */
        return this.query(content, options)
    }

    /*  stop the Apache Tika Server service  */
    async stop () {
        /*  sanity check usage  */
        if (this.proc === null)
            throw new Error("Apache Tika Server process not running")

        /*  send process termination signal and await its shutdown  */
        this.emit("tika-stop")
        this.emit("debug", "tika: stopping")
        return new Promise((resolve, reject) => {
            this.proc.on("close", (code) => {
                this.emit("tika-stopped")
                this.emit("debug", "tika: stopped")
                resolve()
            })
            this.proc.kill("SIGTERM")
        })
    }
}

/*  export API class  */
module.exports = TikaServer

