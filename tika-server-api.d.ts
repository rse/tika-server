/*
**  Tika-Server -- Apache Tika Server as a Background Service
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

declare class TikaServer {
    constructor(options?: {
        javaBinary?: string   /* default: "/usr/opkg/bin/java" */
        javaOptions?: string  /* default: "-server -Xms1G -Xmx1G" */
        tikaBinary?: string   /* default: "${__dirname}/tika-server-cli.jar" */
        tikaConfig?: string   /* default: "${__dirname}/tika-server-cli.xml" */
        tikaOptions?: string  /* default: "--log info" */
        tikaHost?: string     /* default: "127.0.0.1" */
        tikaPortMin?: number  /* default: 41000 */
        tikaPortMax?: number  /* default: 42000 */
    })

    public on(
        event: string,
        callback: (event: any) => void
    ): void

    public start(
    ): Promise<void>

    public query(
        content: any,
        options?: {
            endpoint?: string  /* default: "tika" */
            type?: string      /* default: "application/octet-stream" */
            accept?: string    /* default: "text/xml" */
            response?: string  /* default: "blob" */
            filename?: string  /* default: "" */
        }
    ): Promise<any>

    public queryMeta(
        content: any,
        options?: {
            type?: string      /* default: "application/octet-stream" */
            filename?: string  /* default: "" */
        }
    ): Promise<object>

    public queryText(
        content: any,
        options?: {
            type?: string      /* default: "application/octet-stream" */
            filename?: string  /* default: "" */
        }
    ): Promise<string>

    public stop(
    ): Promise<void>
}

