module.exports = {
    name: ['tbbfraud'],
    args: [{ name: "userId", required: true, specifarg: false, orig: "<userId>" }],
    execute: async function (msg, args, opts = {}) {
        let poopy = this
        let config = poopy.config
        let { axios } = poopy.modules
        let { parseNumber } = poopy.functions

        if (!config.tumoreTesters.includes(msg.author.id)) {
            await msg.reply('Hey, you can\'t use this command! How unfortunate.').catch(() => { })
            return
        }

        if (opts.sourceMsg && msg.author.id != opts.sourceMsg.author.id) {
            await msg.reply("bro").catch(() => { })
            return
        }

        var userIdRaw = args.slice(1).join(' ').trim()
        if (!userIdRaw) {
            await msg.reply('You gotta specify the user ID!').catch(() => { })
            return
        }

        var userId = parseNumber(userIdRaw, { min: 1, round: true })
        if (!userId) {
            await msg.reply('That user ID isn\'t valid.').catch(() => { })
            return
        }
        
        var res = await axios.post(`https://apis.roblox.com/datastores/v1/universes/3913007563/standard-datastores/datastore/entries/entry?datastoreName=${process.env.TBB_DATASTORE}&entryKey=${userId}`, {
            Fraud: true
        }, {
            headers: {
                "x-api-key": process.env.TBB_ROBLOX_KEY,
                "content-type": "application/json"
            }
        }).catch(() => { })

        if (!res) {
            await msg.reply('Fraud request failed.').catch(() => { })
            return
        }

        await msg.reply('Fraud request sent. They\'ll be disbelieved soon.').catch(() => { })
        return 'Fraud request sent. They\'ll be disbelieved soon.'
    },
    help: {
        name: 'tbbfraud <userId>',
        value: 'Fraud someone.'
    },
    type: 'Tumore',
    envRequired: ['TBB_ROBLOX_KEY']
}
