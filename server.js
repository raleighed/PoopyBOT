#!/usr/bin/env -S /bin/node server.js

const throng = require('throng')
const dotenv = require('dotenv')

async function start() {
    let poopyStarted = false
    let poopy
    let { DummyMessage } = require('./src/modules')
    let { sleep } = require('./src/functions')

    if (process.env.RAILWAY_STATIC_URL && !process.env.BOT_WEBSITE) process.env.BOT_WEBSITE = `https://${process.env.RAILWAY_STATIC_URL}`

    if (process.env.BOT_WEBSITE) {
        const express = require('express')
        const cors = require('cors')
        const axios = require('axios')
        const bp = require('body-parser')
        const fs = require('fs-extra')

        const PORT = process.env.PORT || 8080
        const redirects = fs.readJSONSync("html/redirects.json")
        const app = express()

        app.use(cors())
        app.use(bp.json())
        app.use(bp.urlencoded({ extended: true }))

        app.get('/api/waitPoopyStart', async function (_, res) {
            while (!poopyStarted) await sleep(1000)
            res.end()
        })

        app.get('/api/oil', async function (req, res) {
            if (req.query.nowait && !poopyStarted) {
                res.end()
                return
            }

            while (!poopyStarted) await sleep(1000)

            var { refreshDiscordURLs } = poopy.functions

            var shitted

            while (!(shitted = await refreshDiscordURLs(poopy.globaldata.shitting).catch(() => { }))) {
                await sleep(5000)
            }

            res.type('json').send(shitted)
        })

        app.post('/api/command', async function (req, res) {
            while (!poopyStarted) await sleep(1000)

            let callbacks = poopy.callbacks
            let data = poopy.data

            req.body.restype = req.body.restype ?? 'html'
            req.body = req.body ?? {}

            let messages = []

            var msg = new DummyMessage.API({ req, res, poopy, messages })

            data.guildData[msg.guild.id] ??= {}
            data.guildData[msg.guild.id].prefix ??= ''
            data.guildData[msg.guild.id].keyexec ??= 2

            var err
            await Promise.all(
                callbacks.messageCallbacks.map(
                    callback => callback(msg).catch((e) => err = e.message)
               )
            ).catch((e) => err = e.message)
            if (!messages.length) messages.push(req.body.restype == 'json' ? new DummyMessage.API({ req, res, poopy, messages }, err ?? 'No output.') : err ?? 'No output.')

            switch (req.body.restype) {
                case 'json':
                    res.type('json').send(messages)
                    break;

                case 'raw':
                    res.type('text').send(messages.join('\n'))
                    break;

                default:
                    const doc = `<!DOCTYPE html>
                    <html>

                    <head>
                        <title>your command sir</title>
                        <link rel="icon" href="/assets/poopy.png">
                        <link rel="stylesheet" href="/assets/discord.css">
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/highlight.min.js"></script>
                        <script src="/assets/discord.js"></script>
                    </head>
                    
                    <body class="theme-dark">${messages.join('\n')}</body>
                    
                    </html>`
                    res.type('html').send(doc)
                    break;
            }
        })

        const cachedMediaResponses = {}

        app.get("/api/media", async (req, res) => {
            try {
                const url = req.query.url
                if (!url) return res.status(400).send("Missing url query parameter")

                let cached = cachedMediaResponses[url]

                if (!cached) {
                    const response = await axios.get(url, { responseType: "arraybuffer" }).catch(() => { })
                    if (response) {
                        cached = {
                            data: Buffer.from(response.data),
                            contentType: response.headers["content-type"]
                        }

                        cachedMediaResponses[url] = cached
                    } else {
                        res.status(500).send("Error fetching media")
                        return
                    }
                }

                res.setHeader("Access-Control-Allow-Origin", "*")
                res.setHeader("Content-Type", cached.contentType)
                res.send(cached.data)
            } catch (err) {
                console.error(err)
                res.status(500).send("Error fetching media")
            }
        })

        app.get(`${process.env.DATA_ENDPOINT}`, async (req, res) => {
            try {
                const auth = req.query.auth
                const file = req.query.file ?? `data/poopydata.json`
                if (!auth || auth != process.env.AUTH_TOKEN || !fs.existsSync(file)) {
                    // gay
                    res.status(404).sendFile(`${__dirname}/html/errorpages/404.html`)
                    return
                }

                res.sendFile(`${__dirname}/${file}`)
            } catch { }
        })

        redirects.forEach(({ source, destination, permanent }) => {
            app.get(source, (_, res) => {
                res.redirect(permanent ? 301 : 302, destination)
            })
        })

        app.use(express.static('html/public'))

        app.use(function (_, res) {
            res.status(404).sendFile(`${__dirname}/html/errorpages/404.html`)
        })

        app.listen(PORT, () => console.log(`Web is up: ${process.env.BOT_WEBSITE}`))
    }

    const Poopy = require('./poopy')

    let tokens = []

    function testCondition() {
        if (process.argv.find(a => a.trim() == '--test')) return 1
        if (process.argv.find(a => a.trim() == '--hivemind')) return 2
        if (process.argv.find(a => a.trim() == '--secret')) return 3
    }

    function indiaCondition() {
        return process.argv.find(a => a.trim() == '--india')
    }

    switch (testCondition()) {
        case 1:
            tokens = [
                {
                    TOKEN: process.env.TEST_TOKEN,
                    config: {
                        testing: true,
                        globalPrefix: '2p:',
                        database: 'testdata'
                    }
                }
            ]

            if (indiaCondition()) {
                tokens.push(
                    {
                        TOKEN: process.env.INDIA_TOKEN,
                        config: {
                            testing: true,
                            self: true,
                            globalPrefix: 'i:',
                            database: 'testracist',
                            msgcooldown: 3000,
                            useReactions: true,
                            textEmbeds: true,
                            noInfoPost: true,
                            intents: 3276799,
                            allowpresence: false,
                            illKillYouIfYouUseEval: []
                        }
                    }
                )
            }

            break;

        case 2:
            tokens = [
                {
                    TOKEN: process.env.HIVEMIND_TOKEN,
                    config: {
                        testing: true,
                        hivemind: true,
                        noInfoPost: true,
                        globalPrefix: 'hp:',
                        database: 'hiveminddata'
                    }
                }
            ]

            if (indiaCondition()) {
                tokens.push(
                    {
                        TOKEN: process.env.INDIA_TOKEN,
                        config: {
                            testing: true,
                            self: true,
                            globalPrefix: 'i:',
                            database: 'testracist',
                            msgcooldown: 3000,
                            useReactions: true,
                            textEmbeds: true,
                            noInfoPost: true,
                            intents: 3276799,
                            allowpresence: false,
                            illKillYouIfYouUseEval: [],
                        }
                    }
                )
            }

            break;

        case 3:
            tokens = [
                {
                    TOKEN: process.env.SECRET_TOKEN,
                    config: {
                        globalPrefix: 'p:',
                        database: 'secretdata'
                    }
                }
            ]

            break;

        default:
            tokens = [
                {
                    TOKEN: process.env.DEFAULT_TOKEN,
                    config: {
                        globalPrefix: 'p:',
                        noInvite: true
                    }
                },
            ]

            if (indiaCondition()) {
                tokens.push(
                    {
                        TOKEN: process.env.INDIA_TOKEN,
                        config: {
                            self: true,
                            globalPrefix: 'i:',
                            database: 'racist',
                            msgcooldown: 3000,
                            useReactions: true,
                            textEmbeds: true,
                            noInfoPost: true,
                            intents: 3276799,
                            allowpresence: false,
                            illKillYouIfYouUseEval: []
                        }
                    },
                )
            }

            break;
    }

    for (var tokendata of tokens) {
        if (!tokendata?.TOKEN) {
            console.error("Discord bot token NOT FOUND in process.env!")
            continue
        }

        if (!poopy) tokendata.config.quitOnDestroy = true

        let poopoo = new Poopy(tokendata.config)
        if (!poopy) poopy = poopoo

        console.log("pooper created... startign time")
        poopoo.start(tokendata.TOKEN).then(() => {
            if (poopoo.config.quitOnDestroy) {
                poopyStarted = true
            }
        }).catch((e) => console.log(e))

        await sleep(2000)
    }
}

dotenv.config({ quiet: true })

throng({ workers: 1, grace: 0, start }) // My poopy will never die
