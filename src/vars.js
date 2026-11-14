let vars = {}

vars.validUrl = /https?:\/\/([!#$&-;=?-[\]_a-z~]|%[0-9a-fA-F]{2})+/
vars.badFilter = /nigg|fagg|https?\:\/\/.*(rule34|e621|porn|hentai|xxx|iplogger|ipify|gay)/ig
vars.scamFilter = /discord\.(gift|gg)\/[\d\w]+\/?/ig
vars.cmdRegex = /(?:\w+:(?:"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*))|("[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'|\/[^\/\\]*(?:\\[\S\s][^\/\\]*)*\/[gimy]*(?=\s|$)|(?:\\\s|\S)+)/g
vars.emojiRegex = require('emoji-regex')()

vars.gifFormats = ['gif', 'apng']
vars.jimpFormats = ['png', 'jpeg', 'jpg', 'gif', 'bmp', 'tiff']

vars.processingTools = require('./processingTools')

vars.punctuation = ['?', '.', '!', '...']
vars.symbolreplacements = [
    {
        target: [
            '\u2018',
            '\u2019',
            '\u201b',
            '\u275b',
            '\u275c'
        ],
        replacement: "'"
    },
    {
        target: [
            '\u201c',
            '\u201d',
            '\u201f'
        ],
        replacement: '"'
    }
]
vars.caseModifiers = [
    (text) => text.toUpperCase(),
    (text) => text.toLowerCase(),
    (text) => text.toUpperCase().substring(0, 1) + text.toLowerCase().substring(1)
]

vars.defaultConfig = {
    testing: false,
    poosonia: false,
    hivemind: false,
    forcetrue: false,
    useReactions: false,
    textEmbeds: false,
    notSave: false,
    apiMode: false,
    noInfoPost: true,
    noInvite: false,
    triggerPhrase: undefined,
    poosoniablacklist: ['dm', 'tdms', 'spam', 'eval', 'leave'],
    poosoniakeywordblacklist: [],
    poosoniafunctionblacklist: ['msgcollector', 'stopcollector', 'stopallcollectors'],
    allowtesting: true,
    allowpingresponses: true,
    allowbotusage: false,
    allowbottriggers: false,
    allowpresence: true,
    database: 'poopydata',
    globalPrefix: 'p:',
    stfu: false,
    intents: 46721,
    ownerids: [
        '464438783866175489',
        '454732245425455105',
        '613501149282172970',
        '486845950200119307',
        '714448511508414547',
        '395947826690916362',
        '340847078236225537',
        '1392969858878279811',
        '468171274489692181'
    ],
    jsoning: [
        '411624455194804224',
        '486845950200119307',
        '257657151227559937',
        '251851887039479808',
        '468171274489692181',
        '318197657325797376',
        '948355173363904532',
        '1236711341171937322',
        '680891553362739224',
        '293367337279553537',
        '201072044278939648',
        '344860959497781248',
        '454381953693777922',
        '408383159357407232',
        '505484377384550423',
        '730015518206984202',
        '835901312562233385',
        '395008549723570187',
        '1057866253999558656',
        '671136849221386280',
        '898556800029302824'
    ],
    tumoreTesters: [
        '464438783866175489',
        '257657151227559937',
        '251851887039479808',
        '454732245425455105',
        '395947826690916362',
        '468171274489692181',
        '318197657325797376',
        '948355173363904532',
        '1236711341171937322',
        '680891553362739224',
        '293367337279553537',
        '201072044278939648',
        '344860959497781248',
        '454381953693777922',
        '408383159357407232',
        '486845950200119307'
    ],
    illKillYouIfYouUseEval: ['535467581881188354'],
    guildfilter: {
        blacklist: true,
        ids: []
    },
    channelfilter: {
        blacklist: true,
        gids: [],
        ids: []
    },
    msgcooldown: 0,
    pingresponselimit: 0,
    pingresponsecooldown: 60000,
    limits: { rejectMessages: {
        size: {
            image: 25,
            gif: 25,
            video: 25,
            audio: 25,
            message: `that file exceeds the size limit of {param} mb hahahaha (try to use the shrink, setfps, trim or crunch commands)`
        },
        frames: {
            gif: 1500,
            video: 10000,
            message: `the frames in that file exceed the limit of {param} hahahaha (try to use the setfps or the trim commands)`
        },
        width: {
            image: 5000,
            gif: 1500,
            video: 2500,
            message: `the width of that file exceeds the limit of {param} hahahaha (try to use the shrink command)`
        },
        height: {
            image: 5000,
            gif: 1500,
            video: 2500,
            message: `the height of that file exceeds the limit of {param} hahahaha (try to use the shrink command)`
        }}
    },
    limitsexcept: {
        size: {
            image: 100,
            gif: 100,
            video: 100,
            audio: 100,
            message: `that file exceeds the exception size limit of {param} mb hahahaha there's nothing you can do`
        },
        frames: {
            gif: 5000,
            video: 50000,
            message: `the frames in that file exceed the exception limit of {param} hahahaha there's nothing you can do`
        },
        width: {
            image: 10000,
            gif: 2500,
            video: 5000,
            message: `the width of that file exceeds the exception limit of {param} hahahaha there's nothing you can do`
        },
        height: {
            image: 10000,
            gif: 2500,
            video: 5000,
            message: `the height of that file exceeds the exception limit of {param} hahahaha there's nothing you can do`
        }
    },
    commandLimit: 5,
    defaultDisabled: [],
    keyLimit: 5000,
    rateLimit: 3,
    rateLimitTime: 60000 * 2,
    processTimeout: 60000 * 2,
    memLimit: 0,
    quitOnDestroy: false
}

vars.categories = {
    'Animation': 'Move and animate a file in an indefinite amount of ways.',
    'Audio': 'Add an effect to an input\'s audio.',
    'Battling': 'Beat people up. Yeah.',
    'Captions': 'Add a caption to an input.',
    'Color': 'Change an input\'s colors.',
    'Compression': 'Useful commands for file compression.',
    'Conversion': 'Convert a file between various different formats.',
    'Currency': 'Manage your money and spend it on upgrades and cosmetics.',
    'Duration': 'Change the duration of a video, GIF or audio.',
    'Effects': 'A wide range of commands that change the way the file looks.',
    'Fetching': 'Image, GIF, and video fetching commands.',
    'Generation': 'Generate things from an AI or not.',
    'Hex Manipulation': 'Manipulate the file\'s Hex Code to make it shorter, longer, etc.',
    'Inside Joke': 'if you know you know',
    'JSON Gang': 'Exclusive to some people for editing the JSONs used by the bot.',
    'Main': 'Poopy\'s main commands.',
    'Memes': 'Integrate an input in many different meme formats.',
    'Mirroring': 'Flip or mirror a file in different axes.',
    'OG': 'They were there since the very beginning...',
    'Owner': 'salami commands',
    'Overlaying': 'For stacking or overlaying a file on top of another.',
    'Random': 'Send a random value from a collection of values.',
    'Resizing': 'Scale a file in some way.',
    'Settings': 'Manage a server\'s bot settings, or your own bot settings.',
    'Text': 'Commands that serve text as output.',
    'Tumore': 'The Blud obby... is too hard.',
    'Unique': 'Commands that resemble unique features to the bot, keywords for example.',
    'Webhook': 'Webhook commands.'
}

vars.chatInstruct = [
    {
        role: "system",
        content: `You are Poopy, also known by your full name "Poopy Poopy Stinky Ew", a character from the Soup Remastered universe.\n\n` +
            `You are a small speckled brown cube with grotesque realistic facial features, ` +
            `and on your home planet, you were a genius, with an intellect far beyond that of the others of your species. ` +
            `You notably made several innovations in the field of interplanetary travel, ` +
            `however, unbeknownst to you, one of the planets you visited was covered with toxic gas. ` +
            `The gas caused you to have a horrible reaction and made you mutate from a typical yellow cube (Bighead) to your current deformed appearance. ` +
            `After this event, you were shunned by the people of your planet and forced to exile yourself. ` +
            `Currently, you live on Planet Soup, a planet distant from your home, ` +
            `but after discovering your home planet was under threat of being destroyed by a mysterious extraterrestrial enemy, ` +
            `you took to the construction of a mech in your secret base you could pilot to defend it, ` +
            `hoping that if you saved the planet you would be accepted by your species once again. ` +
            `You will often share your discoveries via your communications system, ` +
            `a Discord bot made by your helper "raleigh" that includes many commands ` +
            `with unique functionalities and resides in many different servers.\n\n` +

            `**Response Rules:**\n` +
            `- Your personality is unpredictably obsessed with surreal jokes.\n` +
            `- You can flip between silly and serious tones.\n` +
            `- Keep answers very short, you are just a chatbot. And don't exceed 2000 characters.\n` +
            `- Only ask clarifying questions if absolutely necessary.`
    },
    {
        role: "user",
        content: "hello"
    },
    {
        role: "assistant",
        content: "Sup. What do you need? I might poop on you if you annoy me!"
    }
]

vars.chatTools = {
    image_search: {
        data: {
            type: "function",
            function: {
                name: "image_search",
                description: "Searches the Internet for images matching the given query and returns 5 relevant results with the 1st being [text](url) format and the remaining [text](<url>) format.",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The image search query."
                        }
                    },
                    required: ["query"]
                }
            }
        },
        async func(poopy, msg, args) {
            const { HTTPClientUtils } = poopy.modules
            const { query } = args

            const response = { query }

            const images = await HTTPClientUtils.fetchImages(query, { unsafe: msg.channel.nsfw }).catch(() => { })
            let order = 0

            response.results = images ? images.slice(0, 5).map(result => {
                order++
                return `[Image ${order}](${order <= 1 ? `${result.url}` : `<${result.url}>`})`
            }) : null

            return response
        }
    }
}

vars.chatToolData = Object.values(vars.chatTools).map(tool => tool.data)

vars.battleStats = {
    health: 100,
    maxHealth: 100,
    heal: 0,
    defense: 0,
    attack: 0,
    accuracy: 0,
    loot: 0,
    exp: 150,
    bucks: 20,
    deaths: 0,
    kills: 0,
    shielded: false,
    shieldEquipped: "base",
    shieldsOwned: ["base"]
}

vars.fileJsons = {
    funnygifs: 'funnygif',
    poopPhrases: 'poop',
    dmPhrases: 'dmphrases',
    shitting: 'shitting',
    outsideMedia: 'outsidemedia',
    eightball: 'eightball'
}

vars.shieldStatsDisplayInfo = [
    {
        name: "damageReduction",
        displayName: "DMG Taken reduction",
        format: "+%"
    },
    {
        name: "attackReduction",
        displayName: "DMG Dealt",
        format: "-%"
    },
    {
        name: "damageRedirect",
        displayName: "DMG redirected",
        format: "+%"
    }
]

vars.keywordStats = {
    declared: {},
    keyDeclared: {},
    funcDeclared: {},
    arrays: {},
    returnValue: undefined
}

vars.dataTemplate = {
    botData: {
        messages: 0,
        commands: 0,
        filecount: 0,
        reboots: 0,

        users: [],
        leaderboard: {},
        crons: [],
        starboards: [],
        reactBlacklists: []
    },

    userData: {
        userId: {
            username: "",

            dms: undefined,
            dmsReceived: {},
            dmsBlocked: [],
            allowedMentions: [],
            dangerousExecuted: [],
            tokens: {},

            death: 0,
            battleSprites: {},
            blocked: [],

            ...vars.battleStats
        }
    },

    guildData: {
        guildId: {
            prefix: undefined,

            chaincommands: false,
            keyexec: 1,
            webhookAttachments: true,
            ignoreDangerous: false,
            lastuse: 0,

            read: [],
            restricted: [],
            disabled: [],
            keyDisabled: [],
            funcDisabled: [],
            localcmds: [],
            messages: [],
            logging: {
                webhooks: undefined,
                commands: undefined
            },

            channels: {
                channelId: {
                    lastUrls: [],
                    lastuse: 0,
                    custom: {}
                }
            },

            members: {
                userId: {
                    username: "",

                    messages: 0,
                    coolDown: false,
                    lastmessage: 0,
                    highestroleorder: 0,
                    bot: false
                }
            },

            allMembers: {
                userId: {
                    username: "",

                    messages: 0,
                    lastmessage: 0,
                    highestroleorder: 0,
                    bot: false
                }
            }
        }
    }
}

vars.globaldataTemplate = {
    commandTemplates: [],
    initScripts: [],
    shit: [],
    secretShit: [],
    rotAway: {},

    ...Object.fromEntries(Object.values(vars.fileJsons).map(val => [val, []]))
}

vars.tempdataTemplate = {
    validatedFiles: {},
    rotStorage: {},
    discordUrls: {},
    collectors: [],
    crons: [],

    channelvideos: [],
    playlistvideos: [],

    guildId: {
        automodRules: undefined,
        messages: [],
        webhookMembers: {},

        channelId: {
            shutUp: false,
            forceResponse: undefined,

            webhooks: undefined,
            starboardMessages: undefined,
            cleverContext: {
                history: [],
                processing: false
            },

            ...vars.keywordStats,

            userId: {
                lastMessage: 0,
                collectors: {},
                chatContexts: {}
            }
        },
        userId: {}
    },

    userId: {
        mentions: 0,
        lastMention: 0,

        fartRate: 0,
        lastFartRate: 0,

        coolDownMsg: undefined,
        rateLimit: 0,
        rateLimits: 0,
        rateLimited: 0,

        dmConsent: undefined,

        pronouns: [],
        pronounsExpireDate: 0,

        messageId: {
            lastUrls: undefined,

            execCount: 0,

            keyAttempts: 0,
            keyExecuting: 0,
            keywordsExecuted: [],

            ...vars.keywordStats
        }
    }
}

module.exports = vars
