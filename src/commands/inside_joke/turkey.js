module.exports = {
    name: ['turkey'],
    args: [],
    execute: async function (msg) {
        let poopy = this
        let { sendFile } = poopy.functions
        let { Discord } = poopy.modules

        msg.channel.sendTyping().catch(() => { })
        var attachment = new Discord.AttachmentBuilder('assets/image/turkey.png')
        if (msg.nosend) return await sendFile(msg, 'assets/image', 'turkey.png', { keep: true })
        await msg.reply({
            files: [attachment]
        }).catch(() => { })
    },
    help: {
        name: 'turkey',
        value: 'Happy Thanksgiving from Roblox'
    },
    cooldown: 2500,
    type: 'Inside Joke'
}
