
const TikaService = require(".")

;(async () => {
    const ts = new TikaService()
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

