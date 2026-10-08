const { os, fs, CryptoJS, DiscordTypes, axios, mathjs } = require('./modules')
let vars = require('./vars')
let functions = {}

functions.spawn = require('child_process').spawn
functions.exec = require('child_process').exec
functions.getEmojis = require('../lib/jimpPrint/getEmojis')
functions.lingo = require('./lingo')
functions.gibberish = require('./gibberish')
functions.markov = require('./markov')
functions.genAi = require('./genai')
functions.wackywebm = require('./wackywebm')
functions.dataGather = require('./dataGathering')
functions.brainfuck = require('./brainfuck')
functions.tobrainfuck = require('./tobrainfuck')
functions.generateSayori = require('./sayorimessagegenerator')
functions.braille = require('./braille')
functions.averageColor = require('./averageColor')
functions.spectrogram = require('./spectrogram')
functions.randomAddress = require('./randomaddress')

Math.lerp = function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end
}

String.prototype.toCapperCase = function toCapperCase() {
    return this.toUpperCase().substring(0, 1) + this.toLowerCase().substring(1)
}

functions.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, Math.max(Math.min(ms ?? 0, 2 ** 31 - 1), 0)))
}

functions.requireJSON = function (path) {
    return JSON.parse(fs.readFileSync(path).toString())
}

functions.regexClean = function (str) {
    return str.replace(/[\\^$.|?*+()[{]/g, (match) => `\\${match}`)
}

functions.regexClean = function (str) {
    return str.replace(/[\\^$.|?*+()[{]/g, (match) => `\\${match}`)
}

functions.jsonClean = function (str) {
    return str.replace(/[\\"\u0000-\u001F]/g, (match) => {
        switch (match) {
            case '\\': return '\\\\'
            case '"': return '\\"'
            case '\b': return '\\b'
            case '\f': return '\\f'
            case '\n': return '\\n'
            case '\r': return '\\r'
            case '\t': return '\\t'
            default:
                return `\\u${match.charCodeAt(0).toString(16).padStart(4, '0')}`
        }
    })
}

functions.numberDecimals = function (number, decimalPlaces) {
    return Math.floor(number * (10 ^ decimalPlaces)) / (10 ^ decimalPlaces)
}

functions.escapeHTML = function (value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

functions.unescapeHTML = function (value) {
    return value
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, '\'')
        .replace(/&#[0-9]+;/g, (match) => {
            return String.fromCharCode(match.substring(2, match.length - 1))
        })
}

functions.decrypt = function (str, hide) {
    var decrypted = CryptoJS.AES.decrypt(str, process.env.AUTH_TOKEN).toString(CryptoJS.enc.Utf8)

    if (hide) decrypted = decrypted.replace(/./g, '•')

    return decrypted
}

functions.parMatch = function (string) {
    var lastParenthesesIndex = -1
    var llastParenthesesIndex = -1
    var parindex = 0

    for (var i in string) {
        var char = string[i]

        switch (char) {
            case '(':
                if (parindex <= 0) lastParenthesesIndex = Number(i) // set the index of the last parentheses
                parindex++ // open parentheses found
                break

            case ')':
                if (string[i - 1] !== '\\') {
                    parindex-- // closed parentheses found
                    llastParenthesesIndex = Number(i) + 1
                    if (parindex <= 0) {
                        return string.substring(lastParenthesesIndex, Number(i) + 1)
                    }
                }
                break
        }
    }

    if (llastParenthesesIndex > -1) {
        lastParenthesesIndex++
        return string.substring(lastParenthesesIndex, llastParenthesesIndex)
    }

    return null
}

functions.matchLongestKey = function (str, keys) {
    if (keys.length <= 0) return ['']
    var longest = ['']
    var matched = false
    for (var i in keys) {
        var match = str.match(new RegExp(`^(?<!\\\\)_?(?<!\\\\)${functions.regexClean(keys[i])}`))
        if (match && match[0].length >= longest[0].length) {
            matched = true
            longest = match
        }
    }
    return matched && longest
}

functions.matchLongestFunc = function (str, funcs) {
    if (funcs.length <= 0) return ['']
    var longest = ['']
    var matched = false
    for (var i in funcs) {
        var match = str.match(new RegExp(`${functions.regexClean(funcs[i])}_?$`))
        if (match && match[0].length >= longest[0].length) {
            matched = true
            longest = match
        }
    }
    return matched && longest
}

functions.getIndexOption = function (args, i, {
    dft = undefined, n = 1
} = {}) {
    var slice = args.slice(i, i + n)
    return slice.length ? slice : dft
}

functions.getOption = function (args, name, {
    dft = undefined, n = 1, splice = false, join = true, func = (opt) => opt, stopMatch = []
} = {}) {
    var optionindex = args.indexOf(`-${name}`)
    if (optionindex > -1) {
        var option = []
        var splicecount = 0
        for (var i = 1; i <= Math.min(n, args.length - optionindex - 1); i++) {
            if (stopMatch.includes(args[optionindex + i])) break
            splicecount++
            option.push(func(args[optionindex + i], i))
        }
        if (splice) args.splice(optionindex, splicecount + 1)
        if (join) option = option.join(' ')
        return n == 0 ? true : isNaN(Number(option)) ? option : Number(option)
    }
    return (typeof dft == "function" ? dft() : dft)
}

functions.parseNumber = function (str, {
    dft = undefined, min = -Infinity, max = Infinity, round = false
} = {}) {
    if (str === undefined || str === '') return (typeof dft == "function" ? dft() : dft)
    var number = Number(str)
    return isNaN(number) ? (typeof dft == "function" ? dft() : dft)
        : (round ? Math.round(Math.max(Math.min(number, max), min))
            : Math.max(Math.min(number, max), min)) ?? (typeof dft == "function" ? dft() : dft)
}

functions.parseString = function (str, validList, {
    dft = undefined, lower = false, upper = false
} = {}) {
    if (str == undefined || str === '') return (typeof dft == "function" ? dft() : dft)
    var query = upper ? str.toUpperCase() : lower ? str.toLowerCase() : str
    return validList.find(q => q == query) || (typeof dft == "function" ? dft() : dft)
}

functions.parseKeyword = function (keyword) {
    const pattern = keyword
        .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
        .replace(/\*/g, '\\S*')

    return new RegExp(`\\b${pattern}\\b`, 'i')
}

functions.parseRegExp = function (pattern, flags = "iu") {
    flags = new Set(flags.split(""))

    const inlineFlagRegex = /^\(\?(-?)([a-z])\)/

    let match
    while ((match = pattern.match(inlineFlagRegex)) !== null) {
        const [flag, sign, mods] = match

        for (const char of mods) {
            if (sign === '-') {
                flags.delete(char)
            } else {
                flags.add(char)
            }
        }

        pattern = pattern.replace(flag, '')
    }

    if (flags.has('x')) {
        flags.delete('x')
        pattern = pattern
            .replace(/#.*$/gm, "")
            .replace(/\s+/g, "")
    }

    try {
        return new RegExp(pattern, Array.from(flags).join(''))
    } catch (_) {
        return /(?!.*)/
    }
}

functions.getAllMatches = function (regex, content, group = 0) {
    const matches = []
    const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g")

    let match
    while ((match = r.exec(content)) !== null) {
        matches.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[group]
        })

        if (match.index === r.lastIndex) r.lastIndex++
    }

    return matches
}

functions.overlapsAllowList = function (match, allowRanges) {
    return allowRanges.some(allow =>
        match.start < allow.end && match.end > allow.start
    )
}

functions.maskRange = function (str, start, end) {
    return (
        str.slice(0, start) +
        "[]" /* "#".repeat(end - start) */ +
        str.slice(end)
    )
}

functions.autoModContent = function (content, {
    keywordFilter = [],
    regexPatterns = [],
    allowList = []
} = {}) {
    keywordFilter = keywordFilter.map((k) => functions.parseKeyword(k))
    regexPatterns = regexPatterns.map((r) => functions.parseRegExp(r))
    allowList = allowList.map((k) => functions.parseKeyword(k))

    let broken = false
    let maskedContent = content

    const allowRanges = []
    for (const allow of allowList) {
        allowRanges.push(...functions.getAllMatches(allow, content))
    }

    const allMatches = []

    for (const keyword of keywordFilter) {
        allMatches.push(...functions.getAllMatches(keyword, content))
    }

    for (const pattern of regexPatterns) {
        allMatches.push(...functions.getAllMatches(pattern, content))
    }

    allMatches
        .sort((a, b) => b.start - a.start)
        .forEach(match => {
            if (!functions.overlapsAllowList(match, allowRanges)) {
                broken = true
                maskedContent = functions.maskRange(maskedContent, match.start, match.end)
            }
        })

    return [broken, maskedContent]
}

functions.equalValues = function (arr, val) {
    var count = 0
    arr.forEach(v => v == val && count++)
    return count
}

functions.randomChoice = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)]
}

functions.roundTo = function (n, r) {
    return Math.round(n / r) * r
}

functions.toOrdinal = function (num) {
    num = String(num)
    var thmatch = num.match(/[^1][1-3]$|^[1-3]$/)

    if (thmatch) {
        num += ['st', 'nd', 'rd'][Number(thmatch[0][thmatch[0].length - 1]) - 1]
    } else {
        num += 'th'
    }

    return num
}

functions.randomNumber = function (min, max) {
    if (min == undefined && max == undefined) return Math.random()
    if (max == undefined) {
        max = min
        min = 1
    }

    return Math.floor(Math.random() * (max + 1 - min)) + min
}

functions.shuffle = function (array) {
    var currentIndex = array.length,
        randomIndex

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--

        [array[currentIndex],
        array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex]]
    }

    return array
}

functions.similarity = function (s1, s2) {
    function editDistance(s1, s2) {
        s1 = s1.toLowerCase()
        s2 = s2.toLowerCase()

        var costs = new Array()
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1]
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1
                        costs[j - 1] = lastValue
                        lastValue = newValue
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue
        }
        return costs[s2.length]
    }

    var longer = s1
    var shorter = s2
    if (s1.length < s2.length) {
        longer = s2
        shorter = s1
    }
    var longerLength = longer.length
    if (longerLength == 0) {
        return 1.0
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
}

functions.chunkArray = function (myArray, chunk_size) {
    var arrayLength = myArray.length
    var tempArray = []

    for (var index = 0; index < arrayLength; index += chunk_size) {
        var myChunk = myArray.slice(index, index + chunk_size)
        tempArray.push(myChunk)
    }

    return tempArray;
}

functions.chunkObject = function (object, chunk_size) {
    var values = Object.values(object)
    var final = []
    var counter = 0
    var portion = {}

    for (var key in object) {
        if (counter !== 0 && counter % chunk_size === 0) {
            final.push(portion)
            portion = {}
        }
        portion[key] = values[counter]
        counter++
    }
    final.push(portion)

    return final
}

functions.generateId = function (existing, length = 10) {
    var charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_'
    var id = ''

    for (var i = 0; i < length; i++) {
        id += charset[Math.floor(Math.random() * charset.length)]
    }

    if (existing && existing.includes(id)) return functions.generateId(existing, length)

    return id
}

functions.tryJSONparse = function (obj) {
    try {
        return JSON.parse(obj)
    } catch (_) {
        return null
    }
}

functions.rotAway = function (str = "", {
    rottingTime = false,
    rottingChance = 0,
    forceRot = false,
    begForHelpChance = 0
} = {}, {
    rand = Math.random
} = {}) {
    str = str.trim()
    
    if (!rottingTime || !str || str.length > 2000) return str

    var rotIgnore = [
        "<(?:@&?|#)[0-9]+>",
        "<a?:[a-zA-Z0-9_]+:[0-9]+>",
        "<t:[0-9]+(?::[a-zA-Z])?>",
        "https?:\\/\\/[^\\s<>]+"
    ]

    if (rand() < begForHelpChance)
        str = str.replace(/[^\s]+/ig, (m) => {
            if (rotIgnore.some(reg => new RegExp(reg).test(m))) {
                return m
            }

            return "HELP ME"
        })

    var newStr = str.replace(
        new RegExp(`(?:${rotIgnore.join("|")})|.`, "g"),
        (m) => {
            if (rotIgnore.some(reg => new RegExp(reg).test(m))) {
                return m
            }

            return m + (rand() < rottingChance
                ? String.fromCharCode(Math.floor(rand() * 15000))
                : "")
        }
    ).trim().substring(0, 2000)

    if (str == newStr && forceRot) newStr = (
        str + " " + Array.from({ length: 32 })
            .map(() => String.fromCharCode(Math.floor(rand() * 15000)))
            .join("")
    ).trim().substring(0, 2000)

    return newStr
}

functions.rotMedia = async function (filepath, fileinfo, rottingChance = 0, rottingMethod) {
    let poopy = this
    let { validateFileFromPath, execPromise } = poopy.functions
    let { path } = poopy.modules

    if (typeof fileinfo != "object") return

    // console.log('===ROT MEDIA!===')

    const chanceDecimalDigits = String(rottingChance).split('.')[1]?.length || 0
    const chanceInteger = rottingChance * Math.pow(10, chanceDecimalDigits)

    var dirpath = path.dirname(filepath)
    var filename = path.basename(filepath)

    var scriptext = ""
    var convertext = ""

    // console.log(`rottingChance:`, rottingChance)

    switch (fileinfo.shorttype) {
        case 'image':
            if (fileinfo.type.ext == 'jpg' || fileinfo.type.ext == 'jpeg')
                scriptext = 'jpg'
            else {
                scriptext = 'png'

                if (fileinfo.type.ext != 'png')
                    convertext = 'png'
            }
            break;
        case 'gif':
            scriptext = 'png'

            if (fileinfo.type.ext != 'apng')
                convertext = 'apng'
            break;

        case 'video':
            scriptext = 'avi'

            if (fileinfo.type.ext != 'avi')
                convertext = 'avi'
            break;
    }

    switch (rottingMethod) {
        case 'PNG':
            scriptext = 'png'
            convertext = fileinfo.type.ext == 'png' ? ''
                : (fileinfo.shorttype == 'gif' || fileinfo.shorttype == 'video') ? 'apng'
                : 'png'
            
            break;

        case 'JPEG':
            scriptext = 'jpg'
            convertext = (fileinfo.type.ext == 'jpg' || fileinfo.type.ext == 'jpeg') ? ''
                : 'jpg'
            
            break;

        case 'AVI':
            scriptext = 'avi'
            convertext = fileinfo.type.ext == 'avi' ? '' : 'avi'
            
            break;
    }

    // console.log(`scriptext:`, scriptext)
    // console.log(`convertext:`, convertext)

    if (scriptext == "") {
        return
    }

    fs.renameSync(`${dirpath}/${filename}`, `${dirpath}/rot_${filename}`)

    if (convertext != "") {
        await execPromise(`ffmpeg -i "${dirpath}/rot_${filename}" "${dirpath}/rotconvert_${filename}.${convertext}"`)
        await execPromise(`ffedit -i "${dirpath}/rotconvert_${filename}.${convertext}" -s src/rot_${scriptext}.js -sp [${chanceInteger},${chanceDecimalDigits}] -o "${dirpath}/${filename}.${convertext}"`).then(stdout => { if (Math.random() < 0.05) console.log(stdout) })
        await execPromise(`ffmpeg -i "${dirpath}/${filename}.${convertext}"`
            + `${fileinfo.shortext === 'gif' ? ` -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -gifflags -offsetting` : ''}`
            + `${(fileinfo.shorttype === 'video' && convertext !== 'avi') ? ` -i "${dirpath}/rot_${filename}" -c:a copy -map 0:v:0 -map 1:a:0` : ''}`
            + ` "${dirpath}/${filename}"`)
    } else {
        // console.log(`ffedit -i "${dirpath}/rot_${filename}" -s src/rot_${scriptext}.js -sp [${chanceInteger},${chanceDecimalDigits}] -o "${dirpath}/${filename}"`)
        await execPromise(`ffedit -i "${dirpath}/rot_${filename}" -s src/rot_${scriptext}.js -sp [${chanceInteger},${chanceDecimalDigits}] -o "${dirpath}/${filename}"`).then(stdout => { if (Math.random() < 0.05) console.log(stdout) })
    }

    if (convertext != "") {
        if (fs.existsSync(`${dirpath}/rotconvert_${filename}.${convertext}`)) {
            fs.rmSync(`${dirpath}/rotconvert_${filename}.${convertext}`)
        }
        if (fs.existsSync(`${dirpath}/${filename}.${convertext}`)) {
            fs.rmSync(`${dirpath}/${filename}.${convertext}`)
        }
    }

    if (fs.existsSync(`${dirpath}/rot_${filename}`)) {
        if (fs.existsSync(`${dirpath}/${filename}`)) fs.rmSync(`${dirpath}/rot_${filename}`)
        else {
            fs.renameSync(`${dirpath}/rot_${filename}`, `${dirpath}/${filename}`)
        }
    }
}

functions.rotAllAway = async function (payload, rotConfig) {
    let poopy = this
    let globaldata = poopy.globaldata
    let tempdata = poopy.tempdata
    let { rotAway, rotMedia, xmur3, mulberry32, validateFile, downloadFile, cleanFileInfoUrl } = poopy.functions
    let { Discord, fs, HTTPClientUtils } = poopy.modules

    rotConfig ??= globaldata.rotAway
    if (!rotConfig?.rottingTime) return payload

    if (typeof payload != "object") return rotAway(String(payload), rotConfig)

    payload.content = rotAway(payload.content ?? "", rotConfig)

    if (payload.username) {
        const seedFn = xmur3(payload.username)
        const rand = mulberry32(seedFn())
        payload.username = rotAway(payload.username, rotConfig, { rand })
    }

    if (rotConfig.rotMedia && payload.avatarURL) {
        const fileInfoUrl = cleanFileInfoUrl(payload.avatarURL)
        let rotAvatar = tempdata.rotStorage[fileInfoUrl]

        const rerottingTime = 60_000 * 10
        const refreshRotAvatar = !rotAvatar || (Date.now() - rotAvatar.fetchedTime) >= rerottingTime

        const fileinfo = refreshRotAvatar && await validateFile(payload.avatarURL).catch(() => { })
        if (refreshRotAvatar && fileinfo) {
            const path = await downloadFile(fileinfo.buffer, fileinfo.name, { fileinfo, buffer: true })
            await rotMedia(`${path}/${fileinfo.name}`, fileinfo, rotConfig.rottingChance)

            const fileLink = await HTTPClientUtils.uploadToFileHost(`${path}/${fileinfo.name}`).catch(() => { })
            if (fileLink) tempdata.rotStorage[fileInfoUrl] = {
                fetchedTime: Date.now(),
                fileLink
            }
        }

        payload.avatarURL = tempdata.rotStorage[fileInfoUrl]?.fileLink ?? payload.avatarURL
    }

    if (payload.embeds) payload.embeds.forEach(e => {
        e.title = rotAway(e.title ?? "", rotConfig)
        e.description = rotAway(e.description ?? "", rotConfig)
        if (e.author) e.author.name = rotAway(e.author.name ?? "", rotConfig)
        if (e.footer) e.footer.text = rotAway(e.footer.text ?? "", rotConfig)
        if (e.fields) e.fields.forEach(f => {
            f.name = rotAway(f.name ?? "", rotConfig)
            f.value = rotAway(f.value ?? "", rotConfig)
        })
    })

    if (rotConfig.rotMedia && payload.files) {
        for (const i in payload.files) {
            // console.log(`----File ${i}/${payload.files.length}`)
            const file = payload.files[i]
            // console.log('file:', file)
            const fileinfo = await validateFile(file.attachment).catch(() => { })
            // console.log('fileinfo (relevant parts):', fileinfo.path, fileinfo.name, fileinfo.buffer)
            if (!fileinfo) continue

            const path = await downloadFile(fileinfo.buffer, fileinfo.name, { fileinfo, buffer: true })
            // console.log('downloaded file path:', path)
            const name = file.name ?? fileinfo.name
            // console.log('final file name:', name)

            await rotMedia(`${path}/${fileinfo.name}`, fileinfo, rotConfig.rottingChance)

            payload.files[i] = new Discord.AttachmentBuilder(`${path}/${fileinfo.name}`, { name: name })
            // console.log('changed file:', payload.files[i])

            setTimeout(() => {
                // console.log(`Removing ${path}`)
                fs.rm(path, { force: true, recursive: true })
            }, 60_000)
        }
    }

    return payload
}

functions.replaceAsync = async function (str, regex, asyncFn) {
    var promises = []
    str.replace(regex, (match, ...args) => {
        var promise = asyncFn(match, ...args)
        promises.push(promise)
    })
    var data = await Promise.all(promises)
    return str.replace(regex, () => data.shift())
}

functions.findAsync = async function (arr, asyncCallback) {
    var promises = arr.map(asyncCallback)
    var results = await Promise.all(promises)
    var index = results.findIndex(result => result)
    return arr[index]
}

functions.findIndexAsync = async function (arr, asyncCallback) {
    var promises = arr.map(asyncCallback)
    var results = await Promise.all(promises)
    var index = results.findIndex(result => result)
    return index
}

functions.filterAsync = async function (arr, asyncCallback) {
    var promises = arr.map(asyncCallback)
    var results = await Promise.all(promises)
    return arr.filter((val, i) => results[i])
}

functions.markovChainGenerator = function (texts) {
    if (!Array.isArray(texts)) texts = [texts]

    const markovMap = new Map()

    for (const text of texts) {
        const words = text.split(/\s+/)
        for (let i = 0; i < words.length; i++) {
            const rawWord = words[i]
            if (!rawWord) continue

            const word = rawWord.toLowerCase()
            let node = markovMap.get(word)

            if (!node) {
                node = {
                    word,
                    forms: [],
                    next: [],
                    repeated: 0
                }
                markovMap.set(word, node)
            }

            node.forms.push(rawWord)
            node.repeated++

            if (i + 1 < words.length) {
                node.next.push(words[i + 1])
            }
        }
    }

    const markovChain = Array.from(markovMap.values())
        .sort((a, b) => b.repeated - a.repeated)

    markovChain.findChain = function (w) {
        return markovMap.get(w.toLowerCase()) || null
    }
    markovChain.random = function () {
        return this[Math.floor(Math.random() * this.length)]
    }

    return markovChain
}

functions.markovMe = function (markovChain, text = '', options = {}) {
    var words = markovChain.map(chain => chain.word)

    if (words.length <= 0) return 'no markov data for guild'

    var wordNumber = options.wordNumber
    var nopunctuation = options.nopunctuation
    var keepcase = options.keepcase
    var randlerp = options.randomlerp ?? 0.4

    var result = text ? text.split(' ') : []
    var chain = markovChain.random()
    var word = result[result.length - 1] || chain.forms[Math.floor(Math.random() * chain.forms.length)]
    result.splice(result.length - 1)
    var maxrepeat = markovChain[0].repeated
    var randomchance = 0
    for (var i = 0; i < (wordNumber || Math.min(words.length, Math.floor(Math.random() * 20) + 1)); i++) {
        result.push(word);
        if (vars.validUrl.test(word) && !wordNumber) break
        var markov = markovChain.findChain(word.toLowerCase())
        var newWord = markov.next[Math.floor(Math.random() * markov.next.length)]
        word = newWord
        randomchance = Math.lerp(randomchance, maxrepeat, randlerp)
        if (!word || !markovChain.findChain(word.toLowerCase()) || Math.floor(Math.random() * randomchance) >= maxrepeat * 0.5) {
            randomchance = 0
            chain = markovChain.random()
            word = chain.forms[Math.floor(Math.random() * chain.forms.length)]
        }
    }
    result = result.join(' ')
    if (!vars.punctuation.find(p => result.match(new RegExp(`[${p}]$`))) && Math.floor(Math.random() * 5) === 0 && !nopunctuation) {
        result += vars.punctuation[Math.floor(Math.random() * vars.punctuation.length)]
    }
    if (Math.floor(Math.random() * 5) === 0 && !keepcase) {
        result = vars.caseModifiers[Math.floor(Math.random() * vars.caseModifiers.length)](result)
    }
    return result
}

functions.xmur3 = function (str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
    };
}

functions.mulberry32 = function (a) {
    return function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

functions.updateGenAiModel = async function (
    msg,
    { sample, remove = false } = {}
) {
    let poopy = this;
    let tempdata = poopy.tempdata;
    let { GenAIWorker } = poopy.modules;

    if (!tempdata[msg.guild.id].messageModel) {
        tempdata[msg.guild.id].messageModel = new GenAIWorker(
            tempdata[msg.guild.id].messages.map(m => m.content)
        );
    }

    const modelWorker = tempdata[msg.guild.id].messageModel;

    if (sample) {
        if (remove) {
            await modelWorker.undo(sample);
        } else {
            await modelWorker.train(sample);
        }
    }
}

functions.findpreset = function (args) {
    var presets = [
        'ultrafast',
        'superfast',
        'veryfast',
        'faster',
        'fast',
        'medium',
        'slow',
        'slower',
        'veryslow'
    ]
    var preset = 'ultrafast'
    var presetindex = args.indexOf('-encodingpreset')
    if (presetindex > -1) {
        if (presets.find(preset => preset === args[presetindex + 1].toLowerCase())) {
            preset = args[presetindex + 1]
        }
    }
    return preset
}

functions.randomKey = function (name) {
    var i = 1
    var keys = []
    while (process.env[name + (i != 1 ? i : '')]) {
        keys.push(process.env[name + (i != 1 ? i : '')])
        i++
    }
    return keys[Math.floor(Math.random() * keys.length)]
}

functions.envsExist = function (envs = []) {
    var exist = true

    envs.forEach(env => {
        if (!process.env[env]) exist = false
    })

    return exist
}

functions.configFlagsEnabled = function (reqConfigs = []) {
    let poopy = this
    let config = poopy.config

    var exist = true

    reqConfigs.forEach(reqConfig => {
        if (config[reqConfig] !== true) exist = false
    })

    return exist
}

functions.fetchPingPerms = function (msg) {
    let poopy = this
    let data = poopy.data
    let { DiscordTypes } = poopy.modules

    const allowedGroups = data.userData[msg.author?.id]?.allowedMentions ?? []

    const hasPingPerms = (
        msg.member?.permissions?.has(DiscordTypes.PermissionFlagsBits.Administrator) ||
        msg.channel?.permissionsFor(msg.member)?.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) ||
        msg.author.id == msg.guild.ownerId
    )

    const rolePings = [...msg.mentions.roles.keys()]
    const userPings = [...msg.mentions.users.keys()]
    if (!userPings.includes(msg.author.id)) userPings.push(msg.author.id)

    return {
        parse: hasPingPerms ? allowedGroups : [],
        roles: hasPingPerms && (allowedGroups.includes("roles") || allowedGroups.includes("everyone")) ? undefined : rolePings,
        users: hasPingPerms && (allowedGroups.includes("users") || allowedGroups.includes("everyone")) ? undefined : userPings,
        repliedUser: true
    }
}

functions.execPromise = function (code, opts = {}) {
    const DEBUG = false

    let poopy = this
    let config = poopy.config
    let vars = poopy.vars
    let { fs, os } = poopy.modules
    let { spawn, exec, processTask } = poopy.functions

    return new Promise(async (resolve) => {
        var args = code.match(vars.cmdRegex).map(arg => {
            if (arg.match(/^.*"(?:[^"\\]|\\.)*".*$/)) {
                return arg.replace(/(?<!\\)"/g, "")
            } else {
                return arg
            }
        })

        var command = args.splice(0, 1)[0]

        async function execTask() {
            var execData = {
                type: 'exec',
                code: code,
                files: vars.processingTools.inputs[command](code.split(' ').slice(1))
            }

            /*var taskLength = JSON.stringify(execData)
            if (taskLength > 15 * 1024 * 1024) {
                return
            }*/

            var result = await processTask(execData).catch(() => { })

            if (!result) {
                return 'No output.'
            }

            if (result.files) {
                var name = vars.processingTools.outputs[command](args)
                var dirsplit = name.split('/')
                var dir = dirsplit.slice(0, dirsplit.length - 1).join('/')

                for (var filename in result.files) {
                    fs.writeFileSync(`${dir}/${filename}`, Buffer.from(result.files[filename], 'base64'))
                }
            }

            return result.std
        }

        if (vars.processingTools.inputs[command] && !config.testing && process.env.CLOUDAMQP_URL) {
            var taskValue = await execTask().catch(() => { })
            resolve(taskValue ?? 'No output.')
            return
        }

        var stdout = []
        var stderr = []
        var stdoutclosed = false
        var stderrclosed = false
        var procExited = false

        var proc = spawn(command, args, opts)

        var procTimeout = setTimeout(() => {
            process.kill(proc.pid, "SIGINT")
            proc.removeAllListeners()
            resolve("Process timed out.")
        }, config.processTimeout)

        function handleExit() {
            if (!stdoutclosed || !stderrclosed || !procExited) return
            var out = stdout.join('\n') || stderr.join('\n')
            clearTimeout(procTimeout)
            proc.removeAllListeners()
            resolve(out)
        }

        proc.stdout.on('data', (buffer) => {
            if (!buffer.toString()) return
            stdout.push(buffer.toString())
            if (DEBUG) console.log(buffer.toString())
        })

        proc.stderr.on('data', (buffer) => {
            if (!buffer.toString()) return
            stderr.push(buffer.toString())
            if (DEBUG) console.log(buffer.toString())
        })

        proc.stdout.on('close', () => {
            stdoutclosed = true
            handleExit()
        })

        proc.stderr.on('close', () => {
            stderrclosed = true
            handleExit()
        })

        proc.on('error', (err) => {
            clearTimeout(procTimeout)
            proc.removeAllListeners()
            resolve(err.message)
        })

        proc.on('exit', () => {
            procExited = true
            handleExit()
        })

        if (opts.stdin) {
            proc.stdin.write(opts.stdin)
            proc.stdin.end()
        }
    })
}

functions.substituteIdPropertyWithActualId = function (key, msg) {
    switch (key) {
        case "userId":
            return msg.author.id

        case "guildId":
            return msg.guild.id

        case "channelId":
            return msg.channel.id

        case "messageId":
            return msg.id
    }

    return key
}

functions.reconcileDataWithTemplate = function (data, template, msg, ignoreList = []) {
    let poopy = this

    let { reconcileDataWithTemplate,
        substituteIdPropertyWithActualId } = poopy.functions

    for (property in template) {
        if (ignoreList.includes(property))
            continue

        var dataProperty = substituteIdPropertyWithActualId(property, msg)
        var templateValue = template[property]

        if (data[dataProperty] === undefined) {
            if (Array.isArray(templateValue)) {
                data[dataProperty] = structuredClone(templateValue)
            } else if (templateValue != null && typeof templateValue == "object") {
                data[dataProperty] = {}
            } else {
                data[dataProperty] = templateValue
            }
        }

        var dataValue = data[dataProperty]

        if (
            dataValue !== null && templateValue !== null &&
            typeof dataValue === "object" && typeof templateValue === "object" &&
            !Array.isArray(dataValue) && !Array.isArray(templateValue)
        ) reconcileDataWithTemplate(dataValue, templateValue, msg, ignoreList)
    }
}

functions.gatherData = async function (msg) {
    let poopy = this
    let config = poopy.config
    let data = poopy.data
    let tempdata = poopy.tempdata
    let vars = poopy.vars

    let { dataGather, reconcileDataWithTemplate, workerTask } = poopy.functions

    var now = Date.now()
    var webhook = msg.webhookId || (msg.author.bot && !msg.author.flags)

    if (!webhook) {
        if (!data.userData[msg.author.id]) {
            data.userData[msg.author.id] = !config.testing && process.env.MONGODB_URL && await dataGather.userData(config.database, msg.author.id).catch((e) => console.log(e)) || {}
        }

        if (!data.botData.users.includes(msg.author.id)) {
            data.botData.users.push(msg.author.id)
        }

        data.userData[msg.author.id].username = msg.author.displayName
        reconcileDataWithTemplate(data.userData, vars.dataTemplate.userData, msg)

        if (!data.botData.leaderboard[msg.author.id]) data.botData.leaderboard[msg.author.id] = {}

        data.botData.leaderboard[msg.author.id].tag = msg.author.tag ?? data.botData.leaderboard[msg.author.id].tag ?? msg.author.id
        data.botData.leaderboard[msg.author.id].bucks = data.userData[msg.author.id].bucks
    }

    if (!data.guildData[msg.guild.id]) {
        data.guildData[msg.guild.id] = !config.testing && process.env.MONGODB_URL && await dataGather.guildData(config.database, msg.guild.id).catch((e) => console.log(e)) || {}
    }

    if (data.guildData[msg.guild.id].prefix === undefined) {
        data.guildData[msg.guild.id].prefix = config.globalPrefix
    }

    if (!data.guildData[msg.guild.id].channels) {
        data.guildData[msg.guild.id].channels = {}
    }

    if (!data.guildData[msg.guild.id].channels[msg.channel.id]) {
        data.guildData[msg.guild.id].channels[msg.channel.id] = !config.testing && process.env.MONGODB_URL && await dataGather.channelData(config.database, msg.guild.id, msg.channel.id).catch((e) => console.log(e)) || {}
    }

    reconcileDataWithTemplate(data.guildData[msg.guild.id].channels, vars.dataTemplate.guildData.guildId.channels, msg)

    if (!webhook) {
        if (!data.guildData[msg.guild.id].members) {
            data.guildData[msg.guild.id].members = {}
        }

        if (!data.guildData[msg.guild.id].members[msg.author.id]) {
            data.guildData[msg.guild.id].members[msg.author.id] = !config.testing && process.env.MONGODB_URL && await dataGather.memberData(config.database, msg.guild.id, msg.author.id).catch((e) => console.log(e)) || {}
        }

        reconcileDataWithTemplate(data.guildData[msg.guild.id].members, vars.dataTemplate.guildData.guildId.members, msg)

        if (!data.guildData[msg.guild.id].allMembers) {
            data.guildData[msg.guild.id].allMembers = {}
        }

        if (!data.guildData[msg.guild.id].allMembers[msg.author.id]) {
            data.guildData[msg.guild.id].allMembers[msg.author.id] = {}
        }

        reconcileDataWithTemplate(data.guildData[msg.guild.id].allMembers, vars.dataTemplate.guildData.guildId.allMembers, msg)

        var roleOrder = msg.member.roles?.cache ? Math.max(...msg.member.roles.cache.map(r => r.rawPosition)) : 0

        data.guildData[msg.guild.id].members[msg.author.id].messages++
        data.guildData[msg.guild.id].members[msg.author.id].username = msg.member.displayName
        data.guildData[msg.guild.id].members[msg.author.id].lastmessage = now
        data.guildData[msg.guild.id].members[msg.author.id].highestroleorder = roleOrder
        data.guildData[msg.guild.id].members[msg.author.id].bot = msg.author.bot

        data.guildData[msg.guild.id].allMembers[msg.author.id].messages++
        data.guildData[msg.guild.id].allMembers[msg.author.id].username = msg.member.displayName
        data.guildData[msg.guild.id].allMembers[msg.author.id].lastmessage = now
        data.guildData[msg.guild.id].allMembers[msg.author.id].highestroleorder = roleOrder
        data.guildData[msg.guild.id].allMembers[msg.author.id].bot = msg.author.bot
    }

    //if (!data.guildData[msg.guild.id].messages) {
    //    data.guildData[msg.guild.id].messages = !config.testing && process.env.MONGODB_URL && await dataGather.messageData(config.database, msg.guild.id).catch((e) => console.log(e)) || []
    //}

    if (!data.guildData[msg.guild.id].disabled) {
        data.guildData[msg.guild.id].disabled = config.defaultDisabled
    }

    reconcileDataWithTemplate(data.guildData[msg.guild.id], vars.dataTemplate.guildData.guildId, msg, ["channels", "members", "allMembers"])

    var filteredMessages = data.guildData[msg.guild.id].messages.filter(m => now - m.timestamp < 1000 * 60 * 60 * 24 * 30)

    if (data.guildData[msg.guild.id].messages.length != filteredMessages.length) {
        data.guildData[msg.guild.id].messages = filteredMessages
    }

    if (!tempdata[msg.guild.id]) {
        tempdata[msg.guild.id] = {}
    }

    if (!tempdata[msg.guild.id].messages) {
        tempdata[msg.guild.id].messages = workerTask(
            "decrypt-messages",
            data.guildData[msg.guild.id].messages
        )
    }

    if (tempdata[msg.guild.id].messages instanceof Promise) {
        tempdata[msg.guild.id].messages = await tempdata[msg.guild.id].messages
    }

    if (!tempdata[msg.guild.id][msg.channel.id]) {
        tempdata[msg.guild.id][msg.channel.id] = {}
    }

    if (!webhook) {
        if (!tempdata[msg.guild.id][msg.channel.id][msg.author.id]) {
            tempdata[msg.guild.id][msg.channel.id][msg.author.id] = {}
        }

        reconcileDataWithTemplate(tempdata, vars.tempdataTemplate, msg)

        tempdata[msg.guild.id][msg.channel.id][msg.author.id].bot = msg.author.bot
        tempdata[msg.guild.id][msg.channel.id][msg.author.id].lastMessage = Date.now()

        if (!tempdata[msg.author.id].coolDownMsg) {
            tempdata[msg.author.id].coolDownMsg = msg.id
        }
    }
}

functions.chat = async function (stim, msg, {
    temperature = 1,
    instruct = vars.chatInstruct,
    clear = false,
    useTools = false,
    errorMsg = "Error while generating AI21 chat message."
} = {}) {
    let poopy = this
    let {
        tempdata
    } = poopy
    let {
        userToken
    } = poopy.functions
    let {
        axios
    } = poopy.modules
    let vars = poopy.vars

    if (!stim) stim = "[empty message]"

    if (!tempdata[msg.guild.id]) tempdata[msg.guild.id] = {}
    if (!tempdata[msg.guild.id][msg.channel.id]) tempdata[msg.guild.id][msg.channel.id] = {}
    if (!tempdata[msg.guild.id][msg.channel.id][msg.author.id]) tempdata[msg.guild.id][msg.channel.id][msg.author.id] = {}

    var contexts = tempdata[msg.guild.id][msg.channel.id][msg.author.id].chatContexts
    if (!contexts) contexts = tempdata[msg.guild.id][msg.channel.id][msg.author.id].chatContexts = {}

    var instructMsg = Array.isArray(instruct) ? instruct[0].content : instruct
    if (useTools) instructMsg += `\n- Only use your tools (e.g., image search) when EXPLICITLY told to.`

    var startHistory = Array.isArray(instruct) ? [...instruct] : [
        {
            role: "system",
            content: instructMsg
        }
    ]

    var ourContext = contexts[instructMsg]
    if (!ourContext || (Date.now() - ourContext.lastMessage) > 1000 * 60 * 10 || clear) ourContext = contexts[instructMsg] = {
        history: startHistory
    }

    ourContext.lastMessage = Date.now()

    var ourHistory = ourContext.history

    ourHistory.push({
        role: "user",
        content: stim
    })

    var resp,
        data,
        message

    async function makeChatRequest() {
        const requestData = {
            model: useTools ? "jamba-large" : "jamba-mini",
            messages: ourHistory,
            temperature: temperature,
            top_p: 1
        }

        if (useTools) requestData.tools = vars.chatToolData

        do {
            resp = await axios({
                url: `https://api.ai21.com/studio/v1/chat/completions`,
                method: 'POST',
                data: requestData,
                headers: {
                    Authorization: `Bearer ${userToken(msg.author.id, 'AI21_KEY')}`
                }
            }).catch(() => { })

            data = resp?.data?.choices?.[0]
            message = data?.message
        } while (message?.content && message?.content.includes("tool_calls"))

        if (!message) return

        if (message.tool_calls == null) delete message.tool_calls
        ourHistory.push(message)
    }

    await makeChatRequest()
    if (!message) return errorMsg

    if (message.tool_calls) {
        for (const toolCall of message.tool_calls) {
            const functionName = toolCall.function.name
            const functionArgs = JSON.parse(toolCall.function.arguments)

            const toolFunction = vars.chatTools[functionName].func
            const functionResult = await toolFunction(poopy, msg, functionArgs)

            ourHistory.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(functionResult)
            })
        }

        await makeChatRequest()
        if (!message) return errorMsg
    }

    if (ourHistory.length > 10) {
        ourHistory.splice(1, ourHistory.length - 10)
    }

    var content = (message.content ?? "").replace(
        /((?:!\[[^\]]*]|\[[^\]]*])\([^)]*\))(?!\s|$)/g,
        '$1 '
    )

    return content
}

functions.cleverbot = async function (stim, msg, clear) {
    let poopy = this
    let vars = poopy.vars
    let arrays = poopy.arrays
    let tempdata = poopy.tempdata
    let { axios, CryptoJS } = poopy.modules
    let { randomChoice } = poopy.functions

    if (!tempdata[msg.guild.id]) tempdata[msg.guild.id] = {}
    if (!tempdata[msg.guild.id][msg.channel.id]) tempdata[msg.guild.id][msg.channel.id] = {}

    var context = tempdata[msg.guild.id][msg.channel.id].cleverContext
    if (!context || (Date.now() - context.lastMessage) > 1000 * 60 * 10 || clear) context = tempdata[msg.guild.id][msg.channel.id].cleverContext = {
        history: [],
        processing: false
    }

    context.lastMessage = Date.now()

    if (context.processing) return randomChoice(arrays.eightball)
    context.processing = true

    var history = context.history
    if (history.length > 10) history.splice(0, history.length - 10)

    async function clever() {
        function encodeForSending(a) {
            var f = ""
            var d = ""
            a = a.replace(/[|]/g, "{*}")
            for (var b = 0; b <= a.length; b++) {
                if (a.charCodeAt(b) > 255) {
                    d = escape(a.charAt(b))
                    if (d.substring(0, 2) == "%u") {
                        f += "|" + d.substring(2, d.length)
                    } else {
                        f += d
                    }
                } else {
                    f += a.charAt(b)
                }
            }
            f = f.replace("|201C", "'").replace("|201D", "'").replace("|2018", "'").replace("|2019", "'").replace("`", "'").replace("%B4", "'").replace("|FF20", "").replace("|FE6B", "")
            return escape(f)
        }

        var UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0'

        if (!vars.cleverbotJar) vars.cleverbotJar = await axios.get("https://www.cleverbot.com/extras/conversation-social-min.js", {
            headers: {
                "User-Agent": UA
            }
        }).then(res => res.headers['set-cookie'][0].split(";")[0].split("=")[1]).catch(() => { })
        var jar = vars.cleverbotJar

        var payload = `stimulus=${encodeForSending(stim)}`
        var l = history.length - 1
        for (var i = 0; i <= l; i++) {
            payload += `&vText${i + 2}=${encodeForSending(history[l - i])}`
        }
        payload += `&cb_settings_language=en&cb_settings_scripting=no&islearning=1&icognoid=wsf&icognocheck=`
        payload += CryptoJS.MD5(payload.substring(7, 33)).toString()

        var url = "https://www.cleverbot.com/webservicemin?uc=UseOfficialCleverbotAPI&ncf=V2&ncf=V2&="
        var cookie = `note=1;XVIS=${jar};_cbsid=-1`

        function getLoggingParameters() {
            var historyState = context.history.map(m => encodeURIComponent(m)).join("&")

            url += `&out=${encodeURIComponent(history[l] ?? "")}&in=${encodeURIComponent(stim)}&bot=c` +
                `&cbsid=${context.cbsid ?? ""}&xai=${context.xai ?? ""},${context.rowidandref}` +
                `&ns=${context.history.length / 2 + 1}&al=&dl=&flag=&user=&mode=1&alt=0&reac=&emo=&sou=website&xed=&=`

            cookie += `XAI=${context.xai};CBALT=1~${encodeURIComponent(context.history[l])};` +
                `CBSID=${context.cbsid};CBSTATE=&&0&&0&${context.history.length / 2}&${historyState}).`
        }

        if (context.cbsid) getLoggingParameters()

        var res = await axios({
            method: "POST",
            url,
            data: payload,
            headers: {
                "Content-Type": "text/plain",
                "Cookie": cookie,
                "User-Agent": UA
            }
        })
            .then(a => ({
                xai: a.headers['set-cookie'][0].split(";")[0].split("=")[1],
                data: (typeof a.data == 'string' ? a.data : a.data.toString()).split("\r")
            }))
            .catch((e) => console.log(e))

        if (!res) return ""

        var response = res.data[0]

        context.xai = res.xai
        context.cbsid = res.data[1]
        context.rowidandref = res.data[2]

        if (!context.sessionStarted) {
            context.sessionStarted = true

            getLoggingParameters()

            await axios({
                method: "GET",
                url,
                headers: {
                    "Content-Type": "text/plain",
                    "Cookie": `note=1;XVIS=${jar};_cbsid=-1;CBALT=1~${encodeURIComponent(response)}`,
                    "User-Agent": UA
                }
            })
        }

        return response
    }

    var response = await clever().catch(() => { })

    if (response) {
        if (msg != undefined) {
            history.push(stim)
            history.push(response)
        }
    } else response = randomChoice(arrays.eightball)

    context.processing = false

    return response
}

functions.workerTask = async function (action, ...args) {
    let poopy = this
    let vars = poopy.vars
    let { Worker } = poopy.modules

    return new Promise((resolve, reject) => {
        const worker = new Worker(`./src/workerTask.js`, {
            workerData: { action, args },
            execArgv: ['--no-warnings']
        })

        worker.on("message", resolve)
        worker.on("error", reject)
        worker.on("exit", code => {
            if (code !== 0) reject(new Error(`Worker stopped: ${code}`))
        })
    })
}

functions.processTask = async function (data) {
    let poopy = this
    let vars = poopy.vars
    let { generateId, tryJSONparse } = poopy.functions

    return new Promise(async (resolve, reject) => {
        try {
            var ch = await vars.amqpconn.createChannel().catch(reject)
            var q = await ch.assertQueue('', { exclusive: true }).catch(reject)
            var correlationId = generateId()

            await ch.assertExchange('crash', 'fanout', {
                durable: false
            }).catch(reject)
            var qrash = await ch.assertQueue('', { exclusive: true }).catch(reject)
            ch.bindQueue(qrash.queue, 'crash', '')

            async function closeAll() {
                await ch.cancel(consumer.consumerTag).catch(() => { })
                await ch.cancel(crashconsumer.consumerTag).catch(() => { })
                await ch.deleteQueue(q.queue).catch(() => { })
                await ch.deleteQueue(qrash.queue).catch(() => { })
                await ch.close().catch(() => { })
            }

            var chunkdata = []

            var consumer = await ch.consume(q.queue, function (msg) {
                if (msg.properties.correlationId == correlationId) {
                    var content = msg.content.toString()

                    var order = Number(content.substring(0, 3))
                    var chunk = content.substring(3)
                    chunkdata.push({ order, chunk })
                    chunkdata.sort((a, b) => a.order - b.order)

                    var chunkjoin = chunkdata.map(c => c.chunk).join('')
                    var data = tryJSONparse(chunkjoin)
                    if (data) {
                        closeAll()
                        resolve(data)
                    }
                }
            }, { noAck: true }).catch(reject)

            var crashconsumer = await ch.consume(qrash.queue, function (msg) {
                closeAll()
                reject(msg.content.toString())
            }, { noAck: true }).catch(reject)

            var reqdata = Buffer.from(JSON.stringify(data))
            var msgSizeLimit = 1024 * 1024 * 8 - 3
            var msgNum = Math.ceil(reqdata.length / msgSizeLimit)

            for (var i = 0; i < msgNum; i++) {
                var chunk = reqdata.subarray(msgSizeLimit * i, msgSizeLimit * (i + 1))
                var ordchunk = Buffer.concat([Buffer.from(String(i).padStart(3, '0')), chunk])
                ch.sendToQueue('tasks', ordchunk, {
                    correlationId: correlationId,
                    replyTo: q.queue
                })
            }
        } catch (err) {
            reject(err)
        }
    })
}

functions.infoPost = async function (message) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let vars = poopy.vars
    let { averageColor } = poopy.functions

    if (config.stfu || config.noInfoPost) return

    var avatar = bot.user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' })
    var color = color ?? os.platform() == 'win32' ? { r: 71, g: 37, b: 4 } : await averageColor(avatar)
    vars.color = color

    var infoChannel = bot.guilds.cache.get('834431435704107018')?.channels.cache.get('967083645619830834')
    if (!infoChannel) return

    if (config.textEmbeds) await infoChannel.send({
        content: message,
        allowedMentions: {
            parse: []
        }
    }).catch(() => { })
    else await infoChannel.send({
        embeds: [{
            description: message,
            author: {
                name: bot.user.displayName,
                icon_url: avatar,
            },
            color: (color.r << 8 << 8) + (color.g << 8) + (color.b)
        }]
    }).catch(() => { })
}

functions.getKeyFunc = function (string, { extraKeys = {}, extraFuncs = {}, declaredOnly = false } = {}) {
    let poopy = this
    let special = poopy.special
    let { matchLongestFunc, matchLongestKey } = poopy.functions

    var lastParenthesesIndex = -1
    var llastParenthesesIndex = -1
    var rawParenthesesIndex = -1
    var rawrequired = 0
    var keyindex = -1
    var parindex = -1
    var parenthesesGoal = []
    var potentialindexes = []
    var rawMatch

    var keylist = declaredOnly ? {} : { ...special.keys }
    var funclist = declaredOnly ? {} : { ...special.functions }
    var pfunclist = []

    for (var k in keylist) {
        if (keylist[k].potential) {
            if (keylist[k].potential.funcs) {
                for (var ff in keylist[k].potential.funcs) {
                    pfunclist[ff] = keylist[k].potential.funcs[ff]
                }
            }
        }
    }
    for (var k in extraKeys)
        if (!declaredOnly || (declaredOnly && extraKeys[k].declared))
            keylist[k] = extraKeys[k]

    for (var f in funclist) {
        if (funclist[f].potential) {
            if (funclist[f].potential.funcs) {
                for (var ff in funclist[f].potential.funcs) {
                    pfunclist[ff] = funclist[f].potential.funcs[ff]
                }
            }
        }
    }

    for (var f in extraFuncs)
        if (!declaredOnly || (declaredOnly && extraFuncs[f].declared))
            funclist[f] = extraFuncs[f]

    var keys = Object.keys(keylist).sort((a, b) => b.length - a.length)
    var funcs = Object.keys(funclist).sort((a, b) => b.length - a.length)
    var pfuncs = Object.keys(pfunclist).sort((a, b) => b.length - a.length)

    var keyfiltered = keys.filter((key) => new RegExp(`(?<!\\\\)_?(?<!\\\\)${functions.regexClean(key)}`, 'g').exec(string))
    var funcfiltered = funcs.filter((func) => new RegExp(`${functions.regexClean(func)}(?<!\\\\)_?\\(`, 'g').exec(string))
    var pfuncfiltered = pfuncs.filter((pfunc) => new RegExp(`${functions.regexClean(pfunc)}(?<!\\\\)_?\\(`, 'g').exec(string))
    var keyfirstletters = keyfiltered.map(key => key[0]).filter((item, pos, self) => self.indexOf(item) == pos)

    if ((keyfiltered.length <= 0 && funcfiltered.length <= 0) || string.length > 1024 * 1024) return false

    let urlSpans = []
    let urlRegex = new RegExp(vars.validUrl, 'gi')
    let urlMatch
    while ((urlMatch = urlRegex.exec(string)) !== null) {
        urlSpans.push([urlMatch.index, urlMatch.index + urlMatch[0].length])
    }

    function isNotInUrlOrIsDeclared(index, name, list, extra) {
        return !(urlSpans.some(([start, end]) => index >= start && index < end)) || ((name in extra) || (declaredOnly && (name in list)))
    }

    for (var i in string) {
        var char = string[i]

        if (funcfiltered.length > 0 || pfuncfiltered.length > 0)
            switch (char) {
                case '(':
                    var funcmatch = matchLongestFunc(string.substring(0, i), funcfiltered) // get real function
                    var pfuncmatch = matchLongestFunc(string.substring(0, i), parenthesesGoal.length <= 0 ? pfuncfiltered : ['']) // get probable functions (like resettimer())

                    if (string[i - 1] !== '\\') {
                        if (funcmatch) {
                            parindex++ // open parentheses found
                            lastParenthesesIndex = i // set the index of the last parentheses
                            if (!rawMatch) {
                                var func = funclist[funcmatch[0]] || funclist[funcmatch[0].substring(0, funcmatch[0].length - 1)]
                                if (func) {
                                    if (func.raw) {
                                        rawParenthesesIndex = i
                                        rawrequired++
                                        rawMatch = funcmatch[0]
                                    } // if the function is raw, activate raw setting

                                    if (func.parentheses) {
                                        parenthesesGoal.push(parindex - 1)
                                    } // if the function uses parentheses inside, activate whole parentheses setting
                                }
                            } else {
                                rawrequired++
                            } // if the function isnt inside a raw one, execute it like normal, else add a requirement for raw parentheses
                        } else if (pfuncmatch || pfuncmatch == '') {
                            parindex++ // open parentheses found
                            potentialindexes.push(parindex)
                        }
                    }
                    break

                case ')':
                    var funcmatch = matchLongestFunc(string.substring(0, lastParenthesesIndex), funcfiltered)

                    if (funcmatch && string[i - 1] !== '\\') {
                        if (parenthesesGoal.find(pgoal => parindex == pgoal)) {
                            parenthesesGoal.splice(parenthesesGoal.findIndex(pgoal => parindex == pgoal), 1)
                        }
                        if (potentialindexes.find(ind => ind === parindex)) {
                            potentialindexes.splice(potentialindexes.findIndex(ind => ind === parindex), 1)
                        } else {
                            if (!rawMatch) {
                                if (isNotInUrlOrIsDeclared(lastParenthesesIndex, funcmatch[0], funclist, extraFuncs)) {
                                    lastParenthesesIndex++
                                    return {
                                        match: [funcmatch[0], string.substring(lastParenthesesIndex, i)],
                                        type: 'func'
                                    }
                                }
                            } else {
                                rawrequired--
                                llastParenthesesIndex = i
                                if (rawrequired <= 0) {
                                    if (isNotInUrlOrIsDeclared(rawParenthesesIndex, rawMatch, funclist, extraFuncs)) {
                                        rawParenthesesIndex++
                                        return {
                                            match: [rawMatch, string.substring(rawParenthesesIndex, i)],
                                            type: 'func'
                                        }
                                    }
                                }
                            }
                        }
                        parindex-- // closed parentheses found
                    }
                    break
            }

        if (keyfiltered.length > 0 && keyfirstletters.includes(char)) {
            var keymatch = matchLongestKey(string.substring(i), keys)
            if (keymatch) {
                keyindex = i
                if (rawrequired <= 0 && isNotInUrlOrIsDeclared(i, keymatch[0], keylist, extraKeys)) {
                    return {
                        match: keymatch[0],
                        type: 'key'
                    }
                }
            }
        }
    }

    if (llastParenthesesIndex > -1) {
        var funcmatch = matchLongestFunc(string.substring(0, lastParenthesesIndex), funcfiltered)
        if (isNotInUrlOrIsDeclared(lastParenthesesIndex, funcmatch[0], funclist, extraFuncs)) {
            lastParenthesesIndex++
            return {
                match: [funcmatch[0], string.substring(lastParenthesesIndex, llastParenthesesIndex)],
                type: 'func'
            }
        }
    }

    if (keyindex > -1) {
        var keymatch = matchLongestKey(string.substring(keyindex), keys)
        if (isNotInUrlOrIsDeclared(keyindex, keymatch[0], keylist, extraKeys)) {
            return {
                match: keymatch[0],
                type: 'key'
            }
        }
    }

    return false
}

functions.splitKeyFunc = function (string, { extraFuncs = {}, args = Infinity, separator = '|', declaredOnly = false } = {}) {
    let poopy = this
    let special = poopy.special
    let { matchLongestFunc } = poopy.functions

    var isDefaultSeparator = separator == '|'
    var lastParenthesesIndex = -1
    var lastSplitIndex = 0
    var parenthesesrequired = 0
    var parenthesesGoal = []
    var barfound = 0
    var split = []

    var funclist = declaredOnly ? {} : { ...special.functions }
    var pfunclist = []

    for (var f in funclist) {
        if (funclist[f].potential) {
            if (funclist[f].potential.funcs) {
                for (var ff in funclist[f].potential.funcs) {
                    pfunclist[ff] = funclist[f].potential.funcs[ff]
                }
            }
        }
    }
    for (var f in extraFuncs)
        if (!declaredOnly || (declaredOnly && extraFuncs[f].declared))
            funclist[f] = extraFuncs[f]

    var funcs = Object.keys(funclist).sort((a, b) => b.length - a.length)
    var pfuncs = Object.keys(pfunclist).sort((a, b) => b.length - a.length)
    var afuncs = funcs.concat(pfuncs).sort((a, b) => b.length - a.length)

    var afuncfiltered = afuncs.filter((afunc) => new RegExp(`${functions.regexClean(afunc)}(?<!\\\\)_?\\(`, 'g').exec(string))

    for (var i in string) {
        var char = string[i]
        i = Number(i)

        switch (char) {
            case '(':
                if (afuncfiltered.length > 0 && string[i - 1] !== '\\') {
                    var funcmatch = matchLongestFunc(string.substring(0, i), parenthesesGoal.length <= 0 ? afuncfiltered : [''])
                    if (funcmatch) {
                        lastParenthesesIndex = i
                        parenthesesrequired++
                        var func = funclist[funcmatch[0]]
                        if (func) {
                            if (func.parentheses) {
                                parenthesesGoal.push(parenthesesrequired - 1)
                            }
                        }
                    }
                }
                break

            case separator:
                if (parenthesesrequired <= 0 && string[i - 1] !== '\\') {
                    split.push(string.substring(lastSplitIndex, i - ((string[i - 1] === ' ' && isDefaultSeparator) ? 1 : 0)))
                    lastSplitIndex = i + ((string[i + 1] === ' ' && isDefaultSeparator) ? 2 : 1)
                    barfound++
                }
                break

            case ')':
                if (afuncfiltered.length > 0 && string[i - 1] !== '\\') {
                    var funcmatch = matchLongestFunc(string.substring(0, lastParenthesesIndex), parenthesesGoal.length <= 0 ? afuncfiltered : [''])
                    if (funcmatch) {
                        if (parenthesesGoal.find(pgoal => parenthesesrequired == pgoal)) {
                            parenthesesGoal.splice(parenthesesGoal.findIndex(pgoal => parenthesesrequired == pgoal), 1)
                        }
                        parenthesesrequired--
                    }
                }
                break
        }

        if (barfound == args - 1) {
            break
        }
    }

    split.push(string.substring(lastSplitIndex))

    return split.map(val => isDefaultSeparator ? val.replace(/\\\|/, '|') : val)
}

functions.yesno = async function (channel, content, who, btdata, reply, keepContent) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let { chunkArray, dmSupport, createCollector } = poopy.functions
    let { Discord, DiscordTypes } = poopy.modules

    return new Promise(async (resolve) => {
        if (config.forcetrue) {
            resolve(true)
            return
        }

        var sendObject = {
            content: content
        }

        if (typeof (who) != 'string') {
            sendObject.allowedMentions = {
                parse: (!who.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) &&
                    !who.permissions.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) &&
                    who.id !== channel.guild.ownerId) ?
                    [] : ['users', 'everyone', 'roles']
            }
            who = who.id
        }

        var buttonsData = btdata ?? [
            {
                emoji: '1507804015939817662',
                reactemoji: '✅',
                customid: 'yes',
                style: DiscordTypes.ButtonStyle.Success,
                resolve: true
            },

            {
                emoji: '1507804009535246418',
                reactemoji: '❌',
                customid: 'no',
                style: DiscordTypes.ButtonStyle.Danger,
                resolve: false
            }
        ]

        if (!config.useReactions) {
            var components = []

            var chunkButtonData = chunkArray(buttonsData, 5)

            chunkButtonData.forEach(buttonsData => {
                var buttonRow = new Discord.ActionRowBuilder()
                var buttons = []

                buttonsData.forEach(bdata => {
                    var button = new Discord.ButtonBuilder()
                        .setStyle(bdata.style)
                        .setEmoji(bdata.emoji)
                        .setCustomId(bdata.customid)

                    buttons.push(button)
                })

                buttonRow.addComponents(buttons)

                components.push(buttonRow)
            })

            sendObject.components = components
        }

        var yesnoMsg = await (reply ?? channel)[reply ? 'reply' : 'send'](sendObject).catch(() => { })

        if (!yesnoMsg) {
            resolve(false)
            return
        }

        if (config.useReactions) {
            var collector = createCollector({ id: yesnoMsg.id, type: "reaction", time: 30_000 })

            collector.on('collect', (reaction, user) => {
                dmSupport(reaction)

                if (!(user.id === who && ((user.id !== bot.user.id && !user.bot) || config.allowbotusage))) {
                    return
                }

                var buttonData = buttonsData.find(bdata => bdata.reactemoji == reaction.emoji.toString())

                if (buttonData) {
                    collector.stop()
                    resolve(buttonData.resolve)
                }
            })

            collector.on('end', (_, reason) => {
                if (reason == 'time') {
                    (reply?.isUserApp ? reply.editReply : yesnoMsg.edit).call(reply?.isUserApp ? reply : yesnoMsg, {
                        content: keepContent ? content : 'No response.'
                    }).catch(() => { })
                    yesnoMsg.reactions.removeAll().catch(() => { })
                    resolve(false)
                } else {
                    if (!yesnoMsg.isUserApp) yesnoMsg.delete().catch(() => { })
                }
            })

            for (var i in buttonsData) {
                var bdata = buttonsData[i]
                await yesnoMsg.react(bdata.reactemoji).catch(() => { })
                collector.resetTimer()
            }
        } else {
            var collector = createCollector({ id: yesnoMsg.id, type: "component", time: 30_000 })

            collector.on('collect', (button) => {
                dmSupport(button)

                button.deferUpdate().catch(() => { })

                if (!(button.user.id === who && ((button.user.id !== bot.user.id && !button.user.bot) || config.allowbotusage))) {
                    return
                }

                var buttonData = buttonsData.find(bdata => bdata.customid == button.customId)

                if (buttonData) {
                    collector.stop()
                    resolve(buttonData.resolve)
                }
            })

            collector.on('end', (_, reason) => {
                if (reason == 'time') {
                    (reply?.isUserApp ? reply.editReply : yesnoMsg.edit).call(reply?.isUserApp ? reply : yesnoMsg, {
                        content: keepContent ? content : 'No response.',
                        components: []
                    }).catch(() => { })
                    resolve(false)
                } else {
                    if (!yesnoMsg.isUserApp) yesnoMsg.delete().catch(() => { })
                }
            })
        }
    })
}

functions.selectMenu = async function (channel, content, placeholder, options, exception, who) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let { dmSupport, createCollector } = poopy.functions
    let { Discord } = poopy.modules

    return new Promise(async (resolve) => {
        if (config.useReactions) {
            resolve(exception)
            return
        }

        var sendObject = {
            content: content
        }

        if (typeof (who) != 'string') {
            sendObject.allowedMentions = {
                parse: (!who.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) &&
                    !who.permissions.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) &&
                    who.id !== channel.guild.ownerId) ?
                    [] : ['users', 'everyone', 'roles']
            }
            who = who.id
        }

        var menuRow = new Discord.ActionRowBuilder()
        var menu = new Discord.StringSelectMenuBuilder()
            .setCustomId('selectMenu')
            .setPlaceholder(placeholder)
            .addOptions(options)

        menuRow.addComponents([menu])
        sendObject.components = [menuRow]

        var selectMsg = await channel.send(sendObject).catch(() => { })

        if (!selectMsg) {
            resolve(exception)
            return
        }

        var collector = createCollector({ id: selectMsg.id, type: "component", time: 60_000 })

        collector.on('collect', (option) => {
            dmSupport(option)

            option.deferUpdate().catch(() => { })

            if (!(option.user.id === who && ((option.user.id !== bot.user.id && !option.user.bot) || config.allowbotusage))) {
                return
            }

            collector.stop()
            resolve(option.values[0])
        })

        collector.on('end', (_, reason) => {
            if (reason == 'time') {
                selectMsg.edit({
                    content: 'No response.',
                    components: []
                }).catch(() => { })
                resolve(exception)
            } else {
                selectMsg.delete().catch(() => { })
            }
        })
    })
}

functions.navigateEmbed = async function (channel, pageFunc, results, who, extraButtons, page, selectMenu, errOnFail, endFunc, reply, nolimit) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let tempdata = poopy.tempdata
    let { chunkArray, dmSupport, queryPage, createCollector } = poopy.functions
    let { Discord } = poopy.modules

    page = page ?? 1

    var buttonsData = [
        {
            emoji: '1507804008235143268',
            reactemoji: '⬅️',
            customid: 'previous',
            style: DiscordTypes.ButtonStyle.Primary,
            function: async () => page - 1,
            page: true
        },

        {
            emoji: '1507804012508877002',
            reactemoji: '🔀',
            customid: 'random',
            style: DiscordTypes.ButtonStyle.Primary,
            function: async () => Math.floor(Math.random() * results) + 1,
            page: true
        },

        {
            emoji: '1507804013758906499',
            reactemoji: '➡️',
            customid: 'next',
            style: DiscordTypes.ButtonStyle.Primary,
            function: async () => page + 1,
            page: true
        },

        {
            emoji: '1507804011179278588',
            reactemoji: '🔢',
            customid: 'page',
            style: DiscordTypes.ButtonStyle.Primary,
            function: async (_, interaction) => queryPage(channel, who, page, results, interaction),
            page: true
        }
    ].concat(extraButtons || [])

    var components = []

    if (!config.useReactions) {
        var chunkButtonData = chunkArray(buttonsData, 5)

        chunkButtonData.forEach(buttonsData => {
            var buttonRow = new Discord.ActionRowBuilder()
            var buttons = []

            buttonsData.forEach(bdata => {
                var button = new Discord.ButtonBuilder()
                    .setStyle(bdata.style)
                    .setEmoji(bdata.emoji)
                    .setCustomId(bdata.customid)

                buttons.push(button)
            })

            buttonRow.addComponents(buttons)

            components.push(buttonRow)
        })
    }

    var resultEmbed = await pageFunc(page).catch(() => { })
    var sendObject = {
        components: components.slice()
    }
    var allowedMentions

    if (selectMenu) {
        var menuRow = new Discord.ActionRowBuilder()
        var menu = new Discord.StringSelectMenuBuilder()
            .setCustomId(selectMenu.customid)
            .setPlaceholder(selectMenu.text)
            .addOptions(selectMenu.options)

        menuRow.addComponents([menu])

        buttonsData.push(selectMenu)
        sendObject.components.push(menuRow)
    }

    if (typeof (who) != 'string') {
        allowedMentions = {
            parse: (!who.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) &&
                !who.permissions.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) &&
                who.id !== channel.guild.ownerId) ?
                [] : ['users', 'everyone', 'roles']
        }
        sendObject.allowedMentions = allowedMentions
        who = who.id
    }

    if (config.textEmbeds) sendObject.content = resultEmbed
    else if (resultEmbed?.embeds) for (let key in resultEmbed) sendObject[key] = resultEmbed[key]
    else sendObject.embeds = [resultEmbed]

    var resultsMsg = await (reply ?? channel)[reply ? 'reply' : 'send'](sendObject).catch(() => { })

    if (!resultsMsg) {
        if (errOnFail) throw new Error(`Couldn't send navigable embed to channel`)
        else return
    }

    var usingButton = false

    if (!tempdata[who]) tempdata[who] = {}
    if (!tempdata[who].navigateCollectors) tempdata[who].navigateCollectors = []

    if (!nolimit) {
        var lastCollectors = tempdata[who].navigateCollectors
        if (lastCollectors && lastCollectors.length) lastCollectors.forEach(lastCollector => {
            if (lastCollector.stop) lastCollector.stop()
        })
        tempdata[who].navigateCollectors = []
    }

    if (config.useReactions) {
        var collector = createCollector({ id: resultsMsg.id, type: "reaction", time: 300_000 })
        tempdata[who].navigateCollectors.push(collector)

        collector.on('collect', async (reaction, user) => {
            dmSupport(reaction)

            if (!(user.id === who && ((user.id !== bot.user.id && !user.bot) || config.allowbotusage)) || usingButton) {
                return
            }

            var buttonData = buttonsData.find(bdata => bdata.reactemoji == reaction.emoji.name)

            if (buttonData) {
                usingButton = true
                collector.resetTimer()

                var newpage = await buttonData.function(page, reaction, resultsMsg, collector)
                reaction.users.remove(user).catch(() => { })

                if (buttonData.page) {
                    if (newpage < 1 || newpage > results || newpage == page) {
                        usingButton = false
                        return
                    }

                    page = newpage

                    var resultEmbed = await pageFunc(page).catch(() => { })
                    var sendObject = {
                        components: components.slice()
                    }

                    if (allowedMentions) sendObject.allowedMentions = allowedMentions

                    if (config.textEmbeds) sendObject.content = resultEmbed
                    else if (resultEmbed?.embeds) for (let key in resultEmbed) sendObject[key] = resultEmbed[key]
                    else sendObject.embeds = [resultEmbed];

                    (reply?.isUserApp ? reply.editReply : resultsMsg.edit).call(reply?.isUserApp ? reply : resultsMsg, sendObject).catch(() => { })
                }
                usingButton = false
            }
        })

        collector.on('end', async (_, reason) => {
            var index = tempdata[who].navigateCollectors.indexOf(collector)
            tempdata[who].navigateCollectors.splice(index, 1)

            var resultEmbed = await pageFunc(page, true).catch(() => { })
            var sendObject = {}

            if (allowedMentions) sendObject.allowedMentions = allowedMentions

            if (config.textEmbeds) sendObject.content = resultEmbed
            else if (resultEmbed?.embeds) for (let key in resultEmbed) sendObject[key] = resultEmbed[key]
            else sendObject.embeds = [resultEmbed];

            (reply?.isUserApp ? reply.editReply : resultsMsg.edit).call(reply?.isUserApp ? reply : resultsMsg, sendObject).catch(() => { })

            resultsMsg.reactions.removeAll().catch(() => { })
            if (endFunc) endFunc(reason, page, resultsMsg)
        })

        for (var i in buttonsData) {
            var bdata = buttonsData[i]
            await resultsMsg.react(bdata.reactemoji).catch(() => { })
        }
    } else {
        var collector = createCollector({ id: resultsMsg.id, type: "component", time: 300_000 })
        tempdata[who].navigateCollectors.push(collector)

        collector.on('collect', async (button) => {
            dmSupport(button)

            if (!(button.user.id === who && ((button.user.id !== bot.user.id && !button.user.bot) || config.allowbotusage)) || usingButton) {
                button.deferUpdate().catch(() => { })
                return
            }

            var buttonData = buttonsData.find(bdata => bdata.customid == button.customId)

            if (buttonData) {
                usingButton = true
                collector.resetTimer()

                var newpage = await buttonData.function(page, button, resultsMsg, collector)
                button.deferUpdate().catch(() => { })

                if (buttonData.page) {
                    if (newpage < 1 || newpage > results || newpage == page) {
                        usingButton = false
                        return
                    }

                    page = newpage

                    var resultEmbed = await pageFunc(page).catch(() => { })
                    var sendObject = {
                        components: components.slice()
                    }

                    if (selectMenu) {
                        var menuRow = new Discord.ActionRowBuilder()
                        var menu = new Discord.StringSelectMenuBuilder()
                            .setCustomId(selectMenu.customid)
                            .setPlaceholder(resultEmbed.menuText || selectMenu.text)
                            .addOptions(selectMenu.options)

                        menuRow.addComponents([menu])

                        sendObject.components.push(menuRow)

                        if (resultEmbed?.menuText) delete resultEmbed.menuText
                    }

                    if (allowedMentions) sendObject.allowedMentions = allowedMentions

                    if (config.textEmbeds) sendObject.content = resultEmbed
                    else if (resultEmbed?.embeds) for (let key in resultEmbed) sendObject[key] = resultEmbed[key]
                    else sendObject.embeds = [resultEmbed];

                    (reply?.isUserApp ? reply.editReply : resultsMsg.edit).call(reply?.isUserApp ? reply : resultsMsg, sendObject).catch(() => { })
                }
                usingButton = false
            }
        })

        collector.on('end', async (_, reason) => {
            var index = tempdata[who].navigateCollectors.indexOf(collector)
            tempdata[who].navigateCollectors.splice(index, 1)

            var resultEmbed = await pageFunc(page, true).catch(() => { })
            var sendObject = {
                components: []
            }

            if (allowedMentions) sendObject.allowedMentions = allowedMentions

            if (config.textEmbeds) sendObject.content = resultEmbed
            else if (resultEmbed?.embeds) for (let key in resultEmbed) sendObject[key] = resultEmbed[key]
            else sendObject.embeds = [resultEmbed];

            (reply?.isUserApp ? reply.editReply : resultsMsg.edit).call(reply?.isUserApp ? reply : resultsMsg, sendObject).catch(() => { })

            if (endFunc) endFunc(reason, page, resultsMsg)
        })
    }

    return resultsMsg
}

functions.rainmaze = async function (channel, who, reply, w = 8, h = 6) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let data = poopy.data
    let { chunkArray, dmSupport, randomNumber, createCollector } = poopy.functions
    let { Discord, Rainmaze } = poopy.modules

    var buttonsData = config.useReactions ? [
        {
            emoji: '1507804008235143268',
            reactemoji: '⬅️',
            customid: 'left',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        },

        {
            emoji: '1507804014874595568',
            reactemoji: '⬆️',
            customid: 'up',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        },

        {
            emoji: '1507804001155026995',
            reactemoji: '⬇️',
            customid: 'down',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        },

        {
            emoji: '1507804013758906499',
            reactemoji: '➡️',
            customid: 'right',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        }
    ] : [
        {
            emoji: '1507803999636820018',
            customid: 'null1',
            style: DiscordTypes.ButtonStyle.Secondary,
            control: false
        },

        {
            emoji: '1507804014874595568',
            reactemoji: '⬆️',
            customid: 'up',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        },

        {
            emoji: '1507803999636820018',
            customid: 'null2',
            style: DiscordTypes.ButtonStyle.Secondary,
            control: false
        },

        {
            emoji: '1507804008235143268',
            reactemoji: '⬅️',
            customid: 'left',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        },

        {
            emoji: '1507804001155026995',
            reactemoji: '⬇️',
            customid: 'down',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        },

        {
            emoji: '1507804013758906499',
            reactemoji: '➡️',
            customid: 'right',
            style: DiscordTypes.ButtonStyle.Primary,
            control: true
        }
    ]

    var components = []
    var chunkButtonData = chunkArray(buttonsData, 3)

    if (!config.useReactions) {
        chunkButtonData.forEach(buttonsData => {
            var buttonRow = new Discord.ActionRowBuilder()
            var buttons = []

            buttonsData.forEach(bdata => {
                var button = new Discord.ButtonBuilder()
                    .setStyle(bdata.style)
                    .setEmoji(bdata.emoji)
                    .setCustomId(bdata.customid)

                buttons.push(button)
            })

            buttonRow.addComponents(buttons)

            components.push(buttonRow)
        })
    }

    var rainmaze = new Rainmaze(w, h)
    var raindraw = rainmaze.draw()
    var rainObject = {}
    var allowedMentions
    var tag

    if (config.textEmbeds) rainObject.content = `${raindraw.description}\n\n${raindraw.fields.map(f => `**${f.name}** - ${f.value}`).join('\n')}`
    else rainObject.embeds = [raindraw]

    if (!config.useReactions) rainObject.components = components

    if (typeof (who) != 'string') {
        allowedMentions = {
            parse: (!who.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) &&
                !who.permissions.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) &&
                who.id !== channel.guild.ownerId) ?
                [] : ['users', 'everyone', 'roles']
        }
        rainObject.allowedMentions = allowedMentions
        tag = who.tag ?? who.user.tag
        who = who.id
    }

    var rainMsg = await (reply ?? channel)[reply ? 'reply' : 'send'](rainObject).catch((e) => console.log(e))
    var ended = false

    if (!rainMsg) throw new Error(`Couldn't send Rainmaze to channel`)

    async function updateMaze() {
        raindraw = rainmaze.draw()

        if (ended) {
            if (config.useReactions) rainMsg.reactions.removeAll().catch(() => { })
            else rainObject.components = []

            if (ended == 'win') {
                var reward = randomNumber(w * h, w * h * 2)
                raindraw.fields.push({
                    name: "Reward",
                    value: `+${reward} P$`
                })
                data.userData[who].bucks += reward

                if (!data.botData.leaderboard[who]) data.botData.leaderboard[who] = {}

                data.botData.leaderboard[who].tag = tag ?? data.botData.leaderboard[who].tag ?? who
                data.botData.leaderboard[who].bucks = data.userData[who].bucks
            }
        }

        if (config.textEmbeds) rainObject.content = `${raindraw.description}\n\n${raindraw.fields.map(f => `**${f.name}** - ${f.value}`).join('\n')}`
        else rainObject.embeds = [raindraw];

        (reply?.isUserApp ? reply.editReply : rainMsg.edit).call(reply?.isUserApp ? reply : rainMsg, rainObject).catch(() => { })
    }

    if (config.useReactions) {
        var collector = createCollector({ id: rainMsg.id, type: "reaction", time: 60_000 })

        collector.on('collect', async (reaction, user) => {
            dmSupport(reaction)

            if (!(user.id === who && ((user.id !== bot.user.id && !user.bot) || config.allowbotusage))) {
                return
            }

            var buttonData = buttonsData.find(bdata => bdata.reactemoji == reaction.emoji.name)

            if (buttonData) {
                collector.resetTimer()

                reaction.users.remove(user).catch(() => { })

                if (buttonData.control) {
                    rainmaze.move(buttonData.customid)
                    if (rainmaze.won) {
                        collector.stop('win')
                        return
                    }

                    await updateMaze().catch(() => { })
                }
            }
        })

        collector.on('end', async (_, reason) => {
            ended = reason
            await updateMaze().catch(() => { })
        })

        for (var i in buttonsData) {
            var bdata = buttonsData[i]
            await rainMsg.react(bdata.reactemoji).catch(() => { })
        }
    } else {
        var collector = createCollector({ id: rainMsg.id, type: "component", time: 60_000 })

        collector.on('collect', async (button) => {
            dmSupport(button)

            if (!(button.user.id === who && ((button.user.id !== bot.user.id && !button.user.bot) || config.allowbotusage))) {
                button.deferUpdate().catch(() => { })
                return
            }

            var buttonData = buttonsData.find(bdata => bdata.customid == button.customId)

            if (buttonData) {
                collector.resetTimer()
                button.deferUpdate().catch(() => { })

                if (buttonData.control) {
                    rainmaze.move(buttonData.customid)
                    if (rainmaze.won) {
                        collector.stop('win')
                        return
                    }

                    await updateMaze().catch(() => { })
                }
            }
        })

        collector.on('end', async (_, reason) => {
            ended = reason
            await updateMaze().catch(() => { })
        })
    }

    return raindraw.description
}

functions.votekick = async function (member, channel, voteGoal, action = "timeout", duration = 45_000) {
    let poopy = this
    let tempdata = poopy.tempdata
    let { Discord, DiscordTypes } = poopy.modules
    let { randomChoice, createCollector } = poopy.functions

    const actionNames = {
        timeout: "timed out",
        mute: "muted",
        kick: "kicked",
        ban: "banned"
    }

    const now = Date.now()

    const guild = channel.guild

    const members = Object.entries(tempdata[guild.id][channel.id])
        .filter(([_, m]) => m?.lastMessage != undefined && !m.bot && now - m.lastMessage < 120_000)
        .map(([id, _]) => id)

    member = member ?? guild.members.cache.get(randomChoice(members))

    const user = member.user
    voteGoal = voteGoal ?? Math.ceil(members.length * (1 / 2))

    const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: `${member.displayName} (${user.username})`, iconURL: member.displayAvatarURL({ dynamic: true, size: 1024, extension: "png" }) })
        .setTitle("⚠️ Votekick Initiated")
        .setDescription(`Should **${member.displayName}** be votekicked? **0/${voteGoal}**`)
        .setColor(0xffcc4d)
        .setTimestamp()

    const buttons = new Discord.ActionRowBuilder().addComponents(
        new Discord.ButtonBuilder().setCustomId("yes").setEmoji("1507804015939817662").setStyle(DiscordTypes.ButtonStyle.Success),
        new Discord.ButtonBuilder().setCustomId("no").setEmoji("1507804009535246418").setStyle(DiscordTypes.ButtonStyle.Danger)
    )

    const voteMsg = await channel.send({ embeds: [embed], components: [buttons] }).catch(() => { })

    let votes = new Set()
    let unvotes = new Set()
    const voteCollector = createCollector({ id: voteMsg.id, type: "component", time: duration })

    async function updateVoteEmbed() {
        const updatedEmbed = Discord.EmbedBuilder.from(embed)
            .setDescription(`Should **${member.displayName}** be votekicked? **${votes.size}/${voteGoal}**`)

        const passedGoal = !(votes.size < voteGoal)

        voteMsg.edit({ embeds: [updatedEmbed], components: passedGoal ? [] : [buttons] }).catch(() => { })

        if (passedGoal) voteCollector.stop("passed")
    }

    const voteInterval = setInterval(updateVoteEmbed, 1000)

    voteCollector.on("collect", async (interaction) => {
        if (!(votes.size < voteGoal)) {
            await interaction.reply({ content: "The vote is done.", flags: DiscordTypes.MessageFlags.Ephemeral }).catch(() => { })
            return
        }

        const voter = interaction.user
        if (voter.id === user.id) {
            await interaction.reply({ content: "You can't vote on your own votekick!", flags: DiscordTypes.MessageFlags.Ephemeral }).catch(() => { })
            return
        }

        if (interaction.customId === "yes") {
            votes.add(voter.id)
            unvotes.delete(voter.id)
        } else {
            unvotes.add(voter.id)
            votes.delete(voter.id)
        }

        interaction.reply({ content: `Vote counted: **${interaction.customId.toUpperCase()}**`, flags: DiscordTypes.MessageFlags.Ephemeral }).catch(() => { })
        if (!(votes.size < voteGoal)) updateVoteEmbed()
    })

    voteCollector.on("end", async (_, reason) => {
        clearInterval(voteInterval)

        await voteMsg.edit({ components: [] }).catch(() => { })

        if (reason === "passed") {
            const successEmbed = new Discord.EmbedBuilder()
                .setTitle("✅ Votekick Successful")
                .setDescription(`${user} has been ${actionNames[action]}.\n\n✅ **${votes.size}** ❌ **${unvotes.size}**`)
                .setColor(0x77b255)
                .setTimestamp()

            await voteMsg.reply({ embeds: [successEmbed] }).catch(() => { })

            switch (action) {
                case "timeout": return await member.timeout(600_000).catch(() => { })
                case "mute": {
                    const muteRole = guild.roles.cache.find(r => r.name.toLowerCase().includes("kfc") || r.name.toLowerCase().includes("mute"))

                    if (muteRole) return await member.roles.add(muteRole.id).catch(() => { })
                    else return await member.timeout(600_000).catch(() => { })
                }
                case "kick": return await member.kick().catch(() => { })
                case "ban": return await member.ban().catch(() => { })
            }
        } else {
            const failEmbed = new Discord.EmbedBuilder()
                .setTitle("❌ Votekick Failed")
                .setDescription(`Vote goal not reached in time.\n\n✅ **${votes.size}** ❌ **${unvotes.size}**`)
                .setColor(0xdd2e44)
                .setTimestamp()

            await voteMsg.reply({ embeds: [failEmbed] }).catch(() => { })
        }
    })

    return "Voting initiated."
}

functions.displayShops = async function (msg, shopType, shopMsg) {
    let poopy = this
    let config = poopy.config
    let bot = poopy.bot
    let { displayShop, fetchPingPerms, chunkArray,
        dmSupport, createCollector } = poopy.functions
    let { Discord, DiscordTypes } = poopy.modules

    let types = ['upgrades', 'buffs', 'items', 'shields']

    var buttonsData = [
        {
            emoji: '✨',
            customid: 'upgrades',
            style: DiscordTypes.ButtonStyle.Primary,
            desc: 'Buy upgrades used for battling against others.',
        },
        {
            emoji: '🔥',
            customid: 'buffs',
            style: DiscordTypes.ButtonStyle.Primary,
            desc: '[WIP] Purchase useful temporary buffs during battles.',
        },
        {
            emoji: '💎',
            customid: 'items',
            style: DiscordTypes.ButtonStyle.Primary,
            desc: '[WIP] Buy some cool or useless items.',
        },
        {
            emoji: '🛡️',
            customid: "shields",
            style: DiscordTypes.ButtonStyle.Primary,
            desc: 'Buy various shields that can defend you during battles.'
        }
    ]

    var instruction = buttonsData.map(u => `${u.emoji} **${u.customid}** - ${u.desc}`).join('\n')
    var shopObject = {}
    var ended = false
    var shopMade = false

    if (!shopType) {
        if (msg.nosend)
            return instruction

        var components = []
        var chunkButtonData = chunkArray(buttonsData, 5)

        if (!config.useReactions) chunkButtonData.forEach(buttonsData => {
            var buttonRow = new Discord.ActionRowBuilder()
            var buttons = []

            buttonsData.forEach(bdata => {
                var button = new Discord.ButtonBuilder()
                    .setStyle(bdata.style)
                    .setEmoji(bdata.emoji)
                    .setCustomId(bdata.customid)

                buttons.push(button)
            })

            buttonRow.addComponents(buttons)

            components.push(buttonRow)
        })

        if (config.textEmbeds) {
            shopObject.content = instruction
            shopObject.allowedMentions = fetchPingPerms(msg)
        }
        else {
            shopObject.embeds = [{
                title: "Shop Options",
                description: instruction,
                color: 0x472604,
                footer: {
                    icon_url: bot.user.displayAvatarURL({
                        dynamic: true, size: 1024, extension: 'png'
                    }),
                    text: bot.user.displayName
                },
            }]
        }

        var collector
        var usingReactions = config.useReactions
        var usingComponents = !usingReactions

        if (!config.useReactions)
            shopObject.components = components

        if (!shopMsg)
            shopMsg = await (msg ?? msg.channel)[msg ? 'reply' : 'send'](shopObject)
                .catch((e) => console.log(e))
        else
            (msg?.isUserApp ? msg.editReply : shopMsg.edit).call(msg?.isUserApp ? msg : shopMsg, shopObject).catch((e) => console.log(e))

        if (!shopMsg) throw new Error(`Couldn't send shop to channel`)

        if (usingReactions)
            collector = createCollector({ id: shopMsg.id, type: "reaction", time: 60_000 })
        else
            collector = createCollector({ id: shopMsg.id, type: "component", time: 60_000 })

        collector.on('collect', async (button, user) => {
            dmSupport(button)

            if (usingComponents)
                user = button.user

            var userSameAsCaller = user.id === msg.member.id
            var userIsntBot = user.id !== bot.user.id && !user.bot

            if (!(userSameAsCaller && (userIsntBot || config.allowbotusage))) {
                if (usingComponents)
                    button.deferUpdate().catch(() => { })
                return
            }

            var matchFunc = (buttonData) => buttonData.customid == button.customId
            if (usingReactions)
                matchFunc = (buttonData) => buttonData.emoji == button.emoji.name

            var buttonData = buttonsData.find(matchFunc)

            if (!buttonData)
                return

            collector.resetTimer()

            shopType = buttonData.customid

            if (usingComponents)
                button.deferUpdate().catch(() => { })

            collector.stop('switch')
            await displayShop(msg.channel, msg.member, msg, shopType, shopMsg)
        })

        collector.on('end', async (_, reason) => {
            ended = reason

            if (usingReactions) shopMsg.reactions.removeAll().catch(() => { })
            else shopObject.components = []

            if (shopMsg && reason != 'switch') (msg?.isUserApp ? msg.editReply : shopMsg.edit).call(msg?.isUserApp ? msg : shopMsg, shopObject).catch(() => { })
        })

        return instruction
    }

    if (!types.includes(shopType)) {
        await msg.reply('Not a valid category.').catch(() => { })
        return
    }

    return await displayShop(msg.channel, msg.member, msg, shopType, shopMsg)
}

functions.displayShop = async function (channel, who, reply, shopType, shopMsg) {
    let poopy = this
    let { displayUpgradesShop, displayShieldsShop } = poopy.functions

    if (shopType != "upgrades" && shopType != "shields") {
        await (reply ?? channel)[reply ? 'reply' : 'send']("Work in progress.").catch(() => { })
        return
    }

    var shopObject = {}
    var allowedMentions

    if (typeof (who) != 'string') {
        allowedMentions = {
            parse: (!who.permissions.has(DiscordTypes.PermissionFlagsBits.Administrator) &&
                !who.permissions.has(DiscordTypes.PermissionFlagsBits.MentionEveryone) &&
                who.id !== channel.guild.ownerId) ?
                [] : ['users', 'everyone', 'roles']
        }
        shopObject.allowedMentions = allowedMentions
        who = who.id
    }

    switch (shopType) {
        case 'upgrades':
            return displayUpgradesShop(channel, who, reply, shopObject, shopMsg)

        case 'shields':
            return displayShieldsShop(channel, who, reply, shopObject, shopMsg)
    }
}

functions.displayUpgradesShop = async function (channel, who, reply, shopObject, shopMsg) {
    let poopy = this
    let data = poopy.data
    let bot = poopy.bot
    let config = poopy.config
    let { chunkArray, dmSupport, getLevel,
        displayShops, createCollector } = poopy.functions
    let { Discord, DiscordTypes } = poopy.modules

    let shopType = 'upgrades'

    var upgradeButtonsData = [
        /*{
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
            kills: 0
        },*/

        {
            emoji: '❤',
            customid: 'heal',
            style: DiscordTypes.ButtonStyle.Secondary,
            desc: 'Upgrade your maximum health.',
            oprice: 80
        },

        {
            emoji: '🛡',
            customid: 'defense',
            style: DiscordTypes.ButtonStyle.Secondary,
            desc: 'Increase your defense against attacks.',
            oprice: 120
        },

        {
            emoji: '⚔',
            customid: 'attack',
            style: DiscordTypes.ButtonStyle.Secondary,
            desc: 'Increase your attack damage.',
            oprice: 120
        },

        {
            emoji: '🎯',
            customid: 'accuracy',
            style: DiscordTypes.ButtonStyle.Secondary,
            desc: 'Increase the accuracy of each attack.',
            oprice: 150
        },

        {
            emoji: '🪙',
            customid: 'loot',
            style: DiscordTypes.ButtonStyle.Secondary,
            desc: 'Get more loot while fighting someone.',
            oprice: 150
        }
    ]

    var shopNavigationButtonsData = [
        {
            emoji: '↩',
            customid: 'back',
            style: DiscordTypes.ButtonStyle.Primary,
            label: 'Back'
        }
    ]

    var buttonsData = upgradeButtonsData.concat(shopNavigationButtonsData)

    var userData = data.userData[who]

    shopObject = shopObject ?? {}
    var upgradeList
    var ended = false

    async function updateShop() {
        if (ended === 'switch')
            return

        for (var upgrade of upgradeButtonsData) {
            upgrade.price = upgrade.oprice * (userData[upgrade.customid] + 1)
        }

        buttonsData = upgradeButtonsData.concat(shopNavigationButtonsData)

        var components = []
        var chunkButtonData = chunkArray(buttonsData, 5)

        var level = getLevel(userData.exp).level

        var cap = level >= 20 ? 25 :
            level >= 10 ? 10 :
                5

        if (!config.useReactions) {
            chunkButtonData.forEach(buttonsData => {
                var buttonRow = new Discord.ActionRowBuilder()
                var buttons = []

                buttonsData.forEach(bdata => {
                    var button = new Discord.ButtonBuilder()
                        .setStyle(bdata.style)
                        .setEmoji(bdata.emoji)
                        .setCustomId(bdata.customid)

                    if (bdata.oprice)
                        button = button.setLabel(userData[bdata.customid] >= cap ? `MAX` : `${bdata.price} P$`)

                    buttons.push(button)
                })

                buttonRow.addComponents(buttons)

                components.push(buttonRow)
            })
        }

        upgradeList = upgradeButtonsData.map(buttonData => {
            var emoji = buttonData.emoji
            var stat = buttonData.customid
            var price = buttonData.price
            var desc = buttonData.desc

            var statValue = userData[stat]

            return `${emoji} **${statValue >= cap ? `MAX` : `${price} P$`}** - ${desc} **(${statValue}/${cap})**`
        }).join('\n') + `\n\n**Pobucks:** ${userData.bucks} P$`

        if (config.textEmbeds) shopObject.content = upgradeList
        else shopObject.embeds = [{
            title: `${shopType.toCapperCase()} Shop`,
            description: upgradeList,
            color: 0x472604,
            footer: {
                icon_url: bot.user.displayAvatarURL({
                    dynamic: true, size: 1024, extension: 'png'
                }),
                text: bot.user.displayName
            }
        }]

        if (ended) {
            if (config.useReactions) shopMsg.reactions.removeAll().catch(() => { })
            else shopObject.components = []
        } else if (!config.useReactions) shopObject.components = components

        if (shopMsg) (reply?.isUserApp ? reply.editReply : shopMsg.edit).call(reply?.isUserApp ? reply : shopMsg, shopObject).catch(() => { })
    }

    await updateShop().catch((e) => console.log(e))

    if (!shopMsg)
        shopMsg = await (reply ?? channel)[reply ? 'reply' : 'send'](shopObject).catch((e) => console.log(e))

    if (!shopMsg) throw new Error(`Couldn't send shop to channel`)

    var collector
    var usingReactions = config.useReactions
    var usingComponents = !usingReactions

    if (usingReactions)
        collector = createCollector({ id: shopMsg.id, type: "reaction", time: 60_000 })
    else
        collector = createCollector({ id: shopMsg.id, type: "component", time: 60_000 })

    collector.on('collect', async (button, user) => {
        dmSupport(button)

        if (usingComponents)
            user = button.user

        var userSameAsCaller = user.id === who
        var userIsntBot = user.id !== bot.user.id && !user.bot

        if (!(userSameAsCaller && (userIsntBot || config.allowbotusage))) {
            if (usingComponents)
                button.deferUpdate().catch(() => { })
            return
        }

        var matchFunc = (buttonData) => buttonData.customid == button.customId
        if (usingReactions)
            matchFunc = (buttonData) => buttonData.emoji == button.emoji.name

        var buttonsData = upgradeButtonsData.concat(shopNavigationButtonsData)
        var buttonData = buttonsData.find(matchFunc)

        if (!buttonData)
            return

        if (buttonData.customid == 'back') {
            if (usingComponents)
                button.deferUpdate().catch(() => { })

            collector.stop('switch')
            await displayShops(reply, undefined, shopMsg)
            return
        }

        var level = getLevel(userData.exp).level
        var cap = level >= 20 ? 25 :
            level >= 10 ? 10 :
                5

        collector.resetTimer()

        if (usingReactions)
            button.users.remove(user).catch(() => { })

        var reachedMaxText = 'You can\'t upgrade more than that!'
        var cantAffordText = 'Not enough moners.'

        if (userData[buttonData.customid] >= cap) {
            userData[buttonData.customid] = cap

            if (usingComponents)
                await button.reply({
                    content: reachedMaxText,
                    flags: DiscordTypes.MessageFlags.Ephemeral
                }).catch(() => { })
            else
                await channel.reply(reachedMaxText).catch(() => { })

            await updateShop().catch(() => { })
            return
        }

        if (buttonData.price <= userData.bucks) {
            if (usingComponents)
                button.deferUpdate().catch(() => { })

            userData.bucks -= buttonData.price
            userData[buttonData.customid]++

            if (buttonData.customid == 'heal')
                userData.maxHealth += 10

            await updateShop().catch(() => { })
        } else {
            if (usingComponents)
                await button.reply({
                    content: cantAffordText,
                    flags: DiscordTypes.MessageFlags.Ephemeral
                }).catch((e) => console.log(e))
            else
                await channel.send(cantAffordText).catch(() => { })
        }
    })

    collector.on('end', async (_, reason) => {
        ended = reason
        await updateShop().catch(() => { })
    })

    if (usingReactions) {
        for (var i in buttonsData) {
            var bdata = buttonsData[i]
            await shopMsg.react(bdata.emoji).catch(() => { })
        }
    }

    return upgradeList
}

functions.displayShieldsShop = async function (channel, who, reply, shopObject, shopMsg) {
    let poopy = this
    let data = poopy.data
    let bot = poopy.bot
    let config = poopy.config
    let json = poopy.json
    let { chunkArray, dmSupport, queryPage, createCollector,
        displayShops, getShieldStatsAsEmbedFields } = poopy.functions
    let { Discord, DiscordTypes } = poopy.modules

    let shopType = 'shields'

    var prefix = data.guildData[channel.guild.id].prefix

    var shopNavigationButtonsData = [
        {
            emoji: '1507804002983608330',
            reactemoji: '⏮',
            customid: 'first',
            style: DiscordTypes.ButtonStyle.Primary,
        },

        {
            emoji: '1507804008235143268',
            reactemoji: '⬅',
            customid: 'previous',
            style: DiscordTypes.ButtonStyle.Primary,
        },

        {
            emoji: '1507804013758906499',
            reactemoji: '➡',
            customid: 'next',
            style: DiscordTypes.ButtonStyle.Primary,
        },

        {
            emoji: '1507804005722493119',
            reactemoji: '⏭',
            customid: 'last',
            style: DiscordTypes.ButtonStyle.Primary,
        },

        {
            emoji: '1507804011179278588',
            reactemoji: '🔢',
            customid: 'page',
            style: DiscordTypes.ButtonStyle.Primary,
        },

        {
            customid: 'buy',
            style: DiscordTypes.ButtonStyle.Success,
            label: 'Purchase'
        },

        {
            emoji: '↩',
            reactemoji: '↩',
            customid: 'back',
            style: DiscordTypes.ButtonStyle.Primary,
            label: 'Back'
        }
    ]

    var userData = data.userData[who]

    shopObject = shopObject ?? {}
    var instruction
    var ended = false

    var currentIndex = 0
    var maxIndex = json.shieldJSON.length - 1
    var currentShield = json.shieldJSON[currentIndex]
    var currentShieldIsOwned = true

    var usingReactions = config.useReactions
    var usingComponents = !usingReactions

    async function updateShop() {
        if (ended === 'switch')
            return

        currentShield = json.shieldJSON[currentIndex]
        currentShieldIsOwned = userData.shieldsOwned.includes(currentShield.id)
        var currentShieldCostString = currentShield.cost <= 0 ? 'Free' : `${currentShield.cost} P$`
        var currentShieldNameWithStatus = currentShield.name + (currentShieldIsOwned ? ' *(Owned)*' : '')

        var currentShieldImageFileName = `${currentShield.id}.png`
        var currentShieldImagePath = `assets/image/shields/${currentShieldImageFileName}`

        shopObject.files = [new Discord.AttachmentBuilder(currentShieldImagePath)]

        var components = []
        var chunkButtonData = chunkArray(shopNavigationButtonsData, 5)

        if (usingComponents) {
            chunkButtonData.forEach(buttonsData => {
                var buttonRow = new Discord.ActionRowBuilder()
                var buttons = []

                buttonsData.forEach(bdata => {
                    var button = new Discord.ButtonBuilder()
                        .setStyle(bdata.style)
                        .setCustomId(bdata.customid)

                    if (bdata.label)
                        button = button.setLabel(bdata.label)

                    if (bdata.emoji)
                        button = button.setEmoji(bdata.emoji)

                    if (bdata.customid == 'buy' && currentShieldIsOwned)
                        button = button.setDisabled(true)

                    buttons.push(button)
                })

                buttonRow.addComponents(buttons)

                components.push(buttonRow)
            })
        }

        var shieldStats = []
        shieldStats.push({
            name: 'Cost',
            value: currentShieldCostString,
            inline: true
        })

        shieldStats = shieldStats.concat(getShieldStatsAsEmbedFields(currentShield))

        var currentPageIndex = currentIndex + 1
        var lastPageIndex = maxIndex + 1
        var shopTitle = `${shopType.toCapperCase()} Shop`
        var titleStatusInfo = `(${currentPageIndex} / ${lastPageIndex}) - ${userData.bucks} P$`

        var navigationButtonsText = shopNavigationButtonsData.map(buttonData => {
            var emoji = buttonData.reactemoji
            var customid = buttonData.customid

            return `${emoji} - ${customid}`
        }).join('\n')

        instruction = `**${shopTitle}** ${titleStatusInfo}` +
            `\n\n**${currentShieldNameWithStatus}**` +
            `\n${currentShield.description}` +
            `\n**Cost:** ${currentShieldCostString}` +
            navigationButtonsText + `\n\n**Pobucks:** ${userData.bucks} P$`

        if (config.textEmbeds) shopObject.content = instruction
        else shopObject.embeds = [{
            author: {
                name: shopTitle + ' ' + titleStatusInfo
            },
            title: currentShieldNameWithStatus,
            description: currentShield.description,
            color: 0x472604,
            thumbnail: { url: `attachment://${currentShieldImageFileName}` },
            footer: {
                icon_url: bot.user.displayAvatarURL({
                    dynamic: true, size: 1024, extension: 'png'
                }),
                text: bot.user.displayName
            },
            fields: shieldStats
        }]

        if (ended) {
            if (usingReactions) shopMsg.reactions.removeAll().catch(() => { })
            else shopObject.components = []
        } else if (usingComponents) shopObject.components = components

        if (shopMsg) (reply?.isUserApp ? reply.editReply : shopMsg.edit).call(reply?.isUserApp ? reply : shopMsg, shopObject).catch(() => { })
    }

    await updateShop().catch((e) => console.log(e))

    if (!shopMsg)
        shopMsg = await (reply ?? channel)[reply ? 'reply' : 'send'](shopObject).catch((e) => console.log(e))

    if (!shopMsg) throw new Error(`Couldn't send shop to channel`)

    var collector

    if (usingReactions)
        collector = createCollector({ id: shopMsg.id, type: "reaction", time: 60_000 })
    else
        collector = createCollector({ id: shopMsg.id, type: "component", time: 60_000 })

    collector.on('collect', async (button, user) => {
        dmSupport(button)

        if (usingComponents)
            user = button.user

        var userSameAsCaller = user.id === who
        var userIsntBot = user.id !== bot.user.id && !user.bot

        if (!(userSameAsCaller && (userIsntBot || config.allowbotusage))) {
            if (usingComponents)
                button.deferUpdate().catch(() => { })
            return
        }

        var customid
        if (usingComponents)
            customid = button.customId
        else
            customid = shopNavigationButtonsData.find(buttonData => buttonData.reactemoji === button.emoji.name)

        if (!customid)
            return

        collector.resetTimer()

        var alreadyBoughtText = 'You already own that.'
        var cantAffordText = 'Not enough moners.'

        async function replyGeneric(text, flags) {
            if (usingComponents) {
                var replyData = {
                    content: text
                }

                if (flags)
                    replyData.flags = flags

                await button.reply(replyData).catch((e) => console.log(e))
            }
            else
                await channel.send(text).catch((e) => { console.log(e) })
        }

        async function deferUpdate() {
            if (usingComponents)
                button.deferUpdate().catch(() => { })
        }

        switch (customid) {
            case 'buy':
                if (currentShieldIsOwned) {
                    replyGeneric(alreadyBoughtText, DiscordTypes.MessageFlags.Ephemeral)
                    return
                }

                if (currentShield.cost > userData.bucks) {
                    replyGeneric(cantAffordText, DiscordTypes.MessageFlags.Ephemeral)
                    return
                }

                userData.bucks -= currentShield.cost
                userData.shieldsOwned.push(currentShield.id)

                replyGeneric(`**${currentShield.name}** bought! Equip it from \`${prefix}shields\`.`)

                await updateShop().catch(() => { })
                return

            case 'first':
                deferUpdate()
                currentIndex = 0
                await updateShop().catch((e) => console.log(e))
                break

            case 'previous':
                deferUpdate()
                currentIndex = Math.max(currentIndex - 1, 0)
                await updateShop().catch((e) => console.log(e))
                break

            case 'next':
                deferUpdate()
                currentIndex = Math.min(currentIndex + 1, maxIndex)
                await updateShop().catch((e) => console.log(e))
                break

            case 'last':
                deferUpdate()
                currentIndex = maxIndex
                await updateShop().catch((e) => console.log(e))
                break

            case 'page':
                await queryPage(channel, who, currentIndex + 1, maxIndex + 1, button).then(async (newPage) => {
                    currentIndex = newPage - 1
                    await updateShop().catch((e) => console.log(e))
                }).catch((e) => console.log(e))
                break

            case 'back':
                deferUpdate()
                collector.stop('switch')

                delete shopObject.files
                if (shopMsg)
                    await shopMsg.removeAttachments().catch(() => { })

                return await displayShops(reply, undefined, shopMsg).catch(() => { })
        }
    })

    collector.on('end', async (_, reason) => {
        ended = reason
        await updateShop().catch((e) => console.log(e))
    })

    if (usingReactions) {
        for (var buttonData of shopNavigationButtonsData) {
            await shopMsg.react(buttonData.reactemoji).catch(() => { })
        }
    }

    return instruction
}

functions.createCollector = function ({
    id, type, time,
    filter = () => true
} = {}) {
    let poopy = this
    let tempdata = poopy.tempdata
    let { EventEmitter } = poopy.modules

    const collector = new EventEmitter()

    collector.collect = (...val) => {
        if (!filter(...val)) return null
        collector.collected.push(...val)
        collector.emit("collect", ...val)
    }

    collector.stop = (reason) => {
        const collectorIndex = tempdata.collectors.findIndex(c => c == collector)
        if (collectorIndex > -1) tempdata.collectors.splice(collectorIndex, 1)
        if (collector.timeout) clearTimeout(collector.timeout)
        collector.emit("end", collector.collected, reason ?? "user")
    }

    collector.resetTimer = () => {
        if (collector.timeout) collector.timeout.refresh()
    }

    if (time != null) collector.timeout = setTimeout(() => collector.stop("time"), Math.max(Math.min(time, Number.MAX_SAFE_INTEGER), 0))

    collector.id = id
    collector.type = type
    collector.collected = []

    tempdata.collectors.push(collector)

    return collector
}

functions.cleanContentPreserveEmojis = function (str, channel) {
    return str.replaceAll(
        /<(?:(?<type>@[!&]?|#)|(?:\/(?<commandName>[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai} ]+):))(?<id>\d{17,19})>/gu,
        (match, type, commandName, id) => {
            if (commandName) return `/${commandName}`

            switch (type) {
                case '@':
                case '@!': {
                    const member = channel.guild?.members.cache.get(id)
                    if (member) {
                        return `@${member.displayName}`
                    }

                    const user = channel.client.users.cache.get(id)
                    return user ? `@${user.displayName}` : match
                }

                case '@&': {
                    if (channel.type === Discord.ChannelType.DM) return match
                    const role = channel.guild.roles.cache.get(id)
                    return role ? `@${role.name}` : match
                }

                case '#': {
                    const mentionedChannel = channel.client.channels.cache.get(id)
                    return mentionedChannel ? `#${mentionedChannel.name}` : match
                }

                default: {
                    return match
                }
            }
        }
    )
}

functions.refreshDiscordURLs = async function (urls) {
    let poopy = this
    let tempdata = poopy.tempdata
    let { axios } = poopy.modules
    let { chunkArray, sleep } = poopy.functions

    if (!process.env.DISCORD_REFRESHER_TOKEN) return urls

    let lastRefreshUrl

    try {
        const parsedUrls = urls.map(url => {
            try {
                return new URL(url)
            } catch {
                return null
            }
        }).filter(Boolean)

        const urlRefreshData = []

        for (let i = 0; i < parsedUrls.length; i++) {
            const parsed = parsedUrls[i]
            const isDiscordUrl = /^(cdn\.discordapp\.com|media\.discordapp\.net)$/.test(parsed.hostname)
            const params = new URLSearchParams(parsed.search)

            if (isDiscordUrl && params.get('ex') && params.get('is') && params.get('hm')) {
                const expires = new Date(parseInt(params.get('ex'), 16) * 1000)
                if (expires.getTime() > Date.now()) {
                    urlRefreshData.push({
                        url: parsed.href,
                        refreshed: true,
                        index: i
                    })
                    continue
                }
            }

            const cacheKey = parsed.pathname
            const cached = tempdata.discordUrls[cacheKey]
            if ((cached && cached.expires.getTime() > Date.now()) || !isDiscordUrl) {
                urlRefreshData.push({
                    url: cached?.href ?? parsed.href,
                    refreshed: true,
                    index: i
                })
                continue
            }

            urlRefreshData.push({
                url: parsed.href,
                refreshed: false,
                index: i
            })
        }

        const refreshedUrlData = []

        urlRefreshData
            .filter(urlData => urlData.refreshed)
            .forEach(urlData => refreshedUrlData[urlData.index] = urlData.url)

        const urlDataChunks = chunkArray(urlRefreshData.filter(urlData => !urlData.refreshed), 50)

        let stop = false

        for (const urlDataChunk of urlDataChunks) {
            let success = false
            let attempts = 0

            while (!success) {
                if (attempts >= 10 || stop) {
                    stop = true
                    for (const urlData of urlDataChunk) {
                        refreshedUrlData[urlData.index] = urlData.url
                    }
                    break
                }

                attempts++

                const response = await axios({
                    method: 'POST',
                    url: `https://discord.com/api/v9/attachments/refresh-urls`,
                    data: {
                        attachment_urls: urlDataChunk.map(urlData => urlData.url)
                    },
                    headers: {
                        "Authorization": process.env.DISCORD_REFRESHER_TOKEN,
                        "Accept": "application/json"
                    }
                }).catch(() => { })

                success = response && response.status === 200 && response.data.refreshed_urls?.length

                if (success) {
                    for (let i = 0; i < response.data.refreshed_urls.length; i++) {
                        const refreshed = response.data.refreshed_urls[i]
                        const urlData = urlDataChunk[i]

                        lastRefreshUrl = refreshed.refreshed
                        const refreshedUrl = new URL(refreshed.refreshed)
                        const refreshedParams = new URLSearchParams(refreshedUrl.search)
                        const expires = new Date(parseInt(refreshedParams.get('ex'), 16) * 1000)

                        const cacheKey = refreshedUrl.pathname

                        const cachedUrl = { href: refreshedUrl.href, expires }
                        tempdata.discordUrls[cacheKey] = cachedUrl

                        refreshedUrlData[urlData.index] = refreshedUrl.href
                    }
                } else await sleep(500 * attempts)
            }
        }

        return refreshedUrlData
    } catch (err) {
        console.error("refreshDiscordURLs error:", err, lastRefreshUrl)
        return null
    }
}

functions.correctUrl = async function (url, useYtdlp) {
    let poopy = this
    let { infoPost, execPromise, refreshDiscordURLs } = poopy.functions
    let { axios, cheerio } = poopy.modules

    if (url.match(/^https\:\/\/((cdn|media)\.)?discordapp\.(com|net)\/attachments/) && url.match(/[0-9]+/g) && process.env.DISCORD_REFRESHER_TOKEN) {
        var [refreshedDiscordURL] = await refreshDiscordURLs([url]).catch(() => { })

        if (refreshedDiscordURL) {
            infoPost(`Discord URL detected`)
            return refreshedDiscordURL
        }
    } else if (url.match(/^https\:\/\/(www\.)?tenor\.com\/view/) && url.match(/[0-9]+/g) && process.env.TENOR_KEY) {
        var ids = url.match(/[0-9]+/g)
        var body = await axios(`https://g.tenor.com/v1/gifs?ids=${ids[ids.length - 1]}&key=${process.env.TENOR_KEY}`).catch(() => { })
        if (body && body.data.results.length) {
            infoPost(`Tenor URL detected`)
            return body.data.results[0].media[0].gif.url
        }
    } else if (url.match(/^https\:\/\/(www\.)?gyazo\.com/)) {
        var gyazourl = url.replace(/^https\:\/\/(www\.)?gyazo\.com/, 'https://i.gyazo.com').replace(/\.[a-zA-Z0-9]+$/, "")

        var mp4url = gyazourl + '.mp4'
        var pngurl = gyazourl + '.png'

        var gyazourls = [mp4url, pngurl]
        var gyazourl = undefined
        for (var i in gyazourls) {
            var url = gyazourls[i]
            var response = await axios({
                url: url,
                validateStatus: () => true
            }).catch(() => { })
            if (response && response.status >= 200 && response.status < 300) {
                gyazourl = url
                break
            }
        }
        if (gyazourl) {
            infoPost(`Gyazo URL detected`)
            return gyazourl
        }
    } else if (url.match(/^https\:\/\/(www\.)?imgur\.com/)) {
        var mp4url = url.replace(/^https\:\/\/(www\.)?imgur\.com/, 'https://i.imgur.com') + '.mp4'
        var pngurl = url.replace(/^https\:\/\/(www\.)?imgur\.com/, 'https://i.imgur.com') + '.png'
        var imgurls = [mp4url, pngurl]
        var imgurl = undefined
        for (var i in imgurls) {
            var url = imgurls[i]
            var response = await axios({
                url: url,
                validateStatus: () => true
            }).catch(() => { })
            if (response && response.status >= 200 && response.status < 300) {
                imgurl = url
                break
            }
        }
        if (imgurl) {
            infoPost(`Imgur URL detected`)
            return imgurl
        }
    } else if (url.match(/^https\:\/\/(www\.)?roblox\.com\/(catalog|library|games)\//)) {
        async function getAudio(id) {
            return new Promise((resolve) => {
                axios.get(`https://www.roblox.com/library/${id}`).then(async (res) => {
                    var $ = cheerio.load(res.data)
                    var urls = $("#AssetThumbnail .MediaPlayerIcon")

                    if (urls.length > 0) {
                        resolve(urls[0].attribs['data-mediathumb-url'])
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        async function getTexture(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://assetdelivery.roblox.com/v1/assetId/${id}`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data
                    var rbxmurl = body.location

                    if (!rbxmurl) {
                        resolve()
                        return
                    }

                    axios(rbxmurl).then((rres) => {
                        var rbody = rres.data

                        var $ = cheerio.load(rbody)
                        var urls = $("url")
                        if (urls.length > 0) {
                            var imageasseturl = urls[0].children[0].data
                            var ids = imageasseturl.match(/[0-9]+/g)
                            var id = ids[0]

                            axios({
                                method: 'GET',
                                url: `https://assetdelivery.roblox.com/v1/assetId/${id}`,
                                headers: {
                                    "Accept": "application/json"
                                }
                            }).then((ires) => {
                                var ibody = ires.data
                                var textureurl = ibody.location

                                if (!textureurl) {
                                    resolve()
                                    return
                                }

                                resolve(textureurl)
                            }).catch(() => resolve())
                            return
                        }

                        resolve()
                    }).catch(() => resolve())
                }).catch(() => resolve())
            })
        }

        async function getGame(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${id}&size=512x512&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getGame(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        async function getThumb(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=700x700&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getThumb(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        async function getAsset(id) {
            var info = await axios.get(`https://api.roblox.com/marketplace/productinfo?assetId=${id}`).catch(() => { })

            if (info) {
                if (info.AssetTypeId === 3) {
                    var audiourl = await getAudio(id).catch(() => { })

                    if (audiourl) {
                        infoPost(`Roblox audio URL detected`)
                        return audiourl
                    }
                } else if (info.AssetTypeId === 2 || info.AssetTypeId === 11 || info.AssetTypeId === 12 || info.AssetTypeId === 13) {
                    var imageurl = await getTexture(id).catch(() => { })

                    if (imageurl) {
                        infoPost(`Roblox image asset URL detected`)
                        return imageurl
                    }
                } else if (info.AssetTypeId === 9) {
                    var gameurl = await getGame(id).catch(() => { })

                    if (gameurl) {
                        infoPost(`Roblox game icon URL detected`)
                        return gameurl
                    }
                } else {
                    var asseturl = await getThumb(id).catch(() => { })

                    if (asseturl) {
                        infoPost(`Roblox asset URL detected`)
                        return asseturl
                    }
                }
            }
        }

        var ids = url.match(/[0-9]+/g)
        if (ids.length) {
            var id = ids[0]
            var asseturl = await getAsset(id).catch(() => { })

            if (asseturl) return asseturl
        }
    } else if (url.match(/^https\:\/\/(www\.)?roblox\.com\/(badges)\//)) {
        async function getBadge(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${id}&size=150x150&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getBadge(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        var ids = url.match(/[0-9]+/g)
        if (ids.length) {
            var id = ids[0]
            var badgeurl = await getBadge(id).catch(() => { })

            if (badgeurl) {
                infoPost(`Roblox badge URL detected`)
                return badgeurl
            }
        }
    } else if (url.match(/^https\:\/\/(www\.)?roblox\.com\/(bundles)\//)) {
        async function getBundle(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/bundles/thumbnails?bundleIds=${id}&size=420x420&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getBundle(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        var ids = url.match(/[0-9]+/g)
        if (ids.length) {
            var id = ids[0]
            var bundleurl = await getBundle(id).catch(() => { })

            if (bundleurl) {
                infoPost(`Roblox bundle URL detected`)
                return bundleurl
            }
        }
    } else if (url.match(/^https\:\/\/(www\.)?roblox\.com\/(game-pass)\//)) {
        async function getGamePass(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/game-passes?gamePassIds=${id}&size=150x150&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getGamePass(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        var ids = url.match(/[0-9]+/g)
        if (ids.length) {
            var id = ids[0]
            var gamepassurl = await getGamePass(id).catch(() => { })

            if (gamepassurl) {
                infoPost(`Roblox gamepass URL detected`)
                return gamepassurl
            }
        }
    } else if (url.match(/^https\:\/\/(www\.)?roblox\.com\/(users)\//)) {
        async function getUser(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/users/avatar?userIds=${id}&size=720x720&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getUser(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        var ids = url.match(/[0-9]+/g)
        if (ids.length) {
            var id = ids[0]
            var userurl = await getUser(id).catch(() => { })

            if (userurl) {
                infoPost(`Roblox avatar URL detected`)
                return userurl
            }
        }
    } else if (url.match(/^https\:\/\/(www\.)?roblox\.com\/(groups)\//)) {
        async function getGroup(id) {
            return new Promise((resolve) => {
                axios({
                    method: 'GET',
                    url: `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${id}&size=420x420&format=Png&isCircular=false`,
                    headers: {
                        "Accept": "application/json"
                    }
                }).then(async (res) => {
                    var body = res.data

                    if (body.data ? body.data.length > 0 : false) {
                        if (body.data[0].state === 'Pending') {
                            var url = await getGroup(id).catch(() => { })
                            resolve(url)
                            return
                        }

                        resolve(body.data[0].imageUrl)
                        return
                    }

                    resolve()
                }).catch(() => resolve())
            })
        }

        var ids = url.match(/[0-9]+/g)
        if (ids.length) {
            var id = ids[0]
            var groupurl = await getGroup(id).catch(() => { })

            if (groupurl) {
                infoPost(`Roblox group icon URL detected`)
                return groupurl
            }
        }
    } else if (url.match(/^https\:\/\/((www|m)\.)?youtube\.com|^https\:\/\/(www\.)?youtu\.be/) && useYtdlp) {
        var youtubeurl = await execPromise(`yt-dlp -f 18 -g "${url}"`).catch(() => { })

        if (youtubeurl) {
            infoPost(`YouTube video URL detected`)
            return (youtubeurl.trim().match(vars.validUrl) ?? [url])[0]
        }
    } else if (url.match(/^https\:\/\/(www|on\.)?soundcloud\.com/) && useYtdlp) {
        var soundcloudurl = await execPromise(`yt-dlp "${url}" --get-url`).catch(() => { })

        if (soundcloudurl) {
            infoPost(`SoundCloud URL detected`)
            return (soundcloudurl.trim().match(vars.validUrl) ?? [url])[0]
        }
    } else if (url.match(/^https\:\/\/((www)\.)?(fx)?twitter\.com\/\w{4,15}\/status\/[0-9]+/) && useYtdlp) {
        async function getImageUrl(url) {
            var res = await axios.get(url)
            var $ = cheerio.load(res.data)
            var urls = $('div .AdaptiveMedia-photoContainer.js-adaptive-photo')

            if (urls.length > 0) return urls[0].attribs['data-image-url']
        }

        async function getGifUrl(url) {
            var twittergifurl = await execPromise(`yt-dlp "${url}" --format http --get-url`).catch(() => { })

            return twittergifurl.trim()
        }

        async function getVidUrl(url) {
            var twittervidurl = await execPromise(`yt-dlp "${url}" --get-url`).catch(() => { })

            return twittervidurl.trim()
        }

        var twittervidurl = await getVidUrl(url).catch(() => { })
        var twittergifurl = await getGifUrl(url).catch(() => { })
        var twitterimageurl = await getImageUrl(url).catch(() => { })

        if (twittervidurl) {
            infoPost(`Twitter video URL detected`)
            return twittervidurl
        }

        if (twittergifurl) {
            infoPost(`Twitter GIF URL detected`)
            return twittergifurl
        }

        if (twitterimageurl) {
            infoPost(`Twitter image URL detected`)
            return twitterimageurl
        }
    }

    return url
}

functions.getUrls = async function (msg, options = {}) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let data = poopy.data
    let tempfiles = poopy.tempfiles
    let json = poopy.json
    let vars = poopy.vars
    let { axios } = poopy.modules
    let { infoPost, correctUrl, addLastUrl, getUrls } = poopy.functions

    if (!msg) return []
    var string = (options.string ?? msg.content ?? '').replace(/"([\s\S]*?)"/g, '')
    var prefixFound = options.prefix ?? string.toLowerCase().includes(data.guildData[msg.guild.id].prefix.toLowerCase())
    var max = options.max ?? Infinity
    var urls = []
    var regexes = [
        {
            regexp: vars.emojiRegex,
            func: async function (emoji) {
                var codepoints = []
                for (var j = 0; j < [...emoji].length; j++) {
                    var unicode = [...emoji][j].codePointAt().toString(16).padStart(4, '0')
                    if (unicode == "fe0f") continue
                    codepoints.push(unicode)
                }
                var emojiimage = json.emojiJSON.find(image => image.unicode === codepoints.join('-'))
                if (emojiimage) {
                    infoPost(`Emoji URL detected`)
                    return emojiimage.url
                }
            }
        },
        {
            regexp: /<a?:[a-zA-Z0-9_]+?:[0-9]+>/g,
            func: async function (demoji) {
                var demojiidmatch = demoji.match(/[0-9]+/g)
                var demojiid = demojiidmatch[demojiidmatch.length - 1]
                var gifurl = `https://cdn.discordapp.com/emojis/${demojiid}.gif?size=1024`
                var pngurl = `https://cdn.discordapp.com/emojis/${demojiid}.png?size=1024`
                var demojiurls = [gifurl, pngurl]
                var demojiurl = undefined
                for (var i in demojiurls) {
                    var url = demojiurls[i]
                    var response = await axios({
                        url: url,
                        validateStatus: () => true
                    }).catch(() => { })
                    if (response && response.status >= 200 && response.status < 300) {
                        demojiurl = url
                        break
                    }
                }
                if (demojiurl) {
                    infoPost(`Server emoji URL detected`)
                    return demojiurl
                }
            }
        },
        {
            regexp: /[0-9]{10,}/g,
            func: async function (id) {
                var user = msg.guild.members.cache.get(id) ??
                    await msg.guild.members.fetch(id).catch(() => { }) ??
                    bot.users.cache.get(id) ??
                    await bot.users.fetch(id).catch(() => { })

                if (user) {
                    infoPost(`Discord avatar URL detected`)
                    return user.displayAvatarURL({ dynamic: true, size: 1024, extension: 'png' })
                }
            }
        },
        {
            regexp: /temp:[a-zA-Z0-9_-]{10}/g,
            func: async function (url) {
                var id = url.substring(5)
                var tempfile = tempfiles[id]

                if (tempfile) {
                    infoPost(`Tempfile detected`)
                    return options.tempdir ? `tempfiles/${config.database}/${tempfile.name}` : url
                }
            }
        },
        {
            regexp: vars.validUrl,
            func: async function (url) {
                var correctedurl = await correctUrl(url).catch(() => { }) ?? url

                if (correctedurl == url) infoPost(`Default URL detected`)

                return correctedurl
            }
        }
    ]

    if (!prefixFound) {
        regexes.splice(0, 3)
    }

    var urlregex = new RegExp(regexes.map(regex => `(${regex.regexp.source})`).join('|'), 'g')

    var matches = string.match(urlregex)
    if (matches) {
        var matchesr = matches.reverse()
        for (var i in matchesr) {
            var match = matchesr[i]
            var matched = []
            regexes.forEach(regex => {
                var m = match.match(regex.regexp)
                if (m) {
                    regex.length = m[0].length
                    matched.push(regex)
                }
            })
            matched.sort(function (a, b) {
                return b.length - a.length
            })
            var url = await matched[0].func(match).catch(() => { })
            if (url) urls.unshift(url)
            if (urls.length >= max) break
        }
    }

    if (msg.embeds.length) {
        var embedsR = []
        msg.embeds.forEach(embed => {
            if ((options.update && embed.fetched) || embed.data?.type != 'rich' || !embed.data?.image || !embed.data?.image?.url) return
            embedsR.push(embed.data.image.url)
            if (options.update && !embed.fetched) embed.fetched = true
        })
        embedsR.reverse()
        for (var i in embedsR) {
            var embed = embedsR[i]
            urls.unshift(embed)
            if (urls.length >= max) break
        }
    }

    if (msg.attachments.size) {
        var attachmentsR = []
        msg.attachments.forEach(attachment => {
            if (options.update && attachment.fetched) return
            attachmentsR.push(attachment.url)
            if (options.update && !attachment.fetched) attachment.fetched = true
        })
        attachmentsR.reverse()
        for (var i in attachmentsR) {
            var attachment = attachmentsR[i]
            urls.unshift(attachment)
            if (urls.length >= max) break
        }
    }

    if (msg.stickers.size) {
        var stickersR = []
        msg.stickers.forEach(sticker => {
            if (options.update && sticker.fetched) return
            stickersR.push(sticker.url)
            if (options.update && !sticker.fetched) sticker.fetched = true
        })
        stickersR.reverse()
        for (var i in stickersR) {
            var sticker = stickersR[i]
            urls.unshift(sticker)
            if (urls.length >= max) break
        }
    }

    var reply = await msg.fetchReference().catch(() => { })
    if (reply && !options.replied && msg.author.id != bot.user.id && prefixFound) {
        urls = urls.concat(await getUrls(reply, {
            replied: true,
            max: max - urls.length,
            tempdir: options.tempdir
        }) ?? [])
    }

    if (options.update) {
        var urlsr = urls.reverse()
        for (var i in urlsr) {
            var url = urlsr[i]

            if (url) {
                addLastUrl(msg, url)
            }
        }
    }

    if (urls.length > 0) infoPost(`Found ${urls.length} URL${urls.length > 1 ? 's' : ''} in message`)

    return urls
}

functions.lastUrl = function (msg, i, tempdir, global) {
    let poopy = this
    let config = poopy.config
    let data = poopy.data
    let tempdata = poopy.tempdata
    let tempfiles = poopy.tempfiles
    let { lastUrl } = poopy.functions

    var urlsGlobal = !global &&
        tempdata[msg.author.id]?.[msg.id]?.lastUrls ||
        data.guildData?.[msg.guild.id]?.channels?.[msg.channel.id]?.lastUrls ||
        []
    var urls = urlsGlobal.slice()
    var url = urls[i]

    if (url === undefined) return

    if (url === null) {
        urls.splice(i, 1)
        urlsGlobal.splice(i, 1)
        return lastUrl(msg, i, tempdir)
    }

    if (url.startsWith('temp:')) {
        var id = url.substring(5)
        var tempfile = tempfiles[id]
        if (!tempfile) {
            urls.splice(i, 1)
            urlsGlobal.splice(i, 1)
            return lastUrl(msg, i, tempdir)
        } else if (tempdir) {
            url = `tempfiles/${config.database}/${tempfile.name}`
        }
    }

    return url
}

functions.lastUrls = function (msg, tempdir, global) {
    let poopy = this
    let config = poopy.config
    let data = poopy.data
    let tempdata = poopy.tempdata
    let tempfiles = poopy.tempfiles

    var urlsGlobal = !global &&
        tempdata[msg.author.id]?.[msg.id]?.lastUrls ||
        data.guildData?.[msg.guild.id]?.channels?.[msg.channel.id]?.lastUrls ||
        []
    var urls = urlsGlobal.slice()

    for (var i = 0; i < urls.length; i++) {
        var url = urls[i]

        if (url === undefined) continue

        if (url === null) {
            urls.splice(i, 1)
            urlsGlobal.splice(i, 1)
            i--
            continue
        }

        if (url.startsWith('temp:')) {
            var id = url.substring(5)
            var tempfile = tempfiles[id]
            if (!tempfile) {
                urls.splice(i, 1)
                urlsGlobal.splice(i, 1)
                i--
                continue
            } else if (tempdir) {
                urls[i] = `tempfiles/${config.database}/${tempfile.name}`
            }
        }
    }

    return urls
}

functions.addLastUrl = function (msg, url) {
    let poopy = this
    let data = poopy.data
    let tempdata = poopy.tempdata
    let { lastUrls } = poopy.functions

    if (!url) return

    if (tempdata[msg.author.id][msg.id]) {
        var lasturls = [url].concat(lastUrls(msg))
        lasturls.splice(1000)
        tempdata[msg.author.id][msg.id].lastUrls = lasturls
    }

    var lasturls = [url].concat(lastUrls(msg, false, true))
    lasturls.splice(1000)
    data.guildData[msg.guild.id].channels[msg.channel.id].lastUrls = lasturls
}

functions.createLog = async function (type, member, logData) {
    let poopy = this
    let data = poopy.data
    let { Discord } = poopy.modules
    let { validUrl } = poopy.vars

    const guild = member.guild

    const logChannelID = data.guildData[guild?.id]?.logging[type]
    if (!logChannelID) return

    const logChannel = guild?.channels?.cache?.get(logChannelID) ?? await guild?.channels?.fetch(logChannelID).catch(() => { })
    if (!logChannel) return

    const logPayload = {
        allowedMentions: { parse: [] }
    }

    const logEmbed = new Discord.EmbedBuilder()
        .setAuthor({
            name: `${member.displayName} (${member.user.username})`,
            iconURL: member.displayAvatarURL({ dynamic: true, size: 1024, extension: "png" })
        })
        .setColor(0xffcc4d)
        .setTimestamp()

    switch (type) {
        case "webhooks": {
            const { msg, webhookMsg, payload } = logData

            if (webhookMsg?.embeds && webhookMsg?.embeds?.some(e => e.data.title == "Webhook message sent")) return

            const attachments = webhookMsg.attachments ?? []
            logPayload.files = attachments.map(a => new Discord.AttachmentBuilder(a.attachment))

            const footerAvatar = payload.avatarURL ?? webhookMsg.author.displayAvatarURL({ dynamic: true, size: 1024, extension: "png" }) ?? ""

            logEmbed.setTitle("Webhook message sent")
                .setDescription(
                    `> **Channel:** ${msg.channel.name} (<#${msg.channel.id}>)\n` +
                    `> **Message ID:** [${webhookMsg.id}](${webhookMsg.url})\n` +
                    `> **Message author:** ${member.user.tag} (<@${member.user.id}>)\n` +
                    `> **Message created:** <t:${Math.floor(Date.now() / 1000)}:R>`
                )
                .setFooter({
                    text: `Webhook: ${payload.username ?? webhookMsg.author.username}`,
                    iconURL: validUrl.test(footerAvatar) ? footerAvatar : undefined
                })

            if (webhookMsg.content) logEmbed.addFields(
                { name: "Message", value: webhookMsg.content }
            )
            if (attachments.size) logEmbed.addFields(
                { name: "Attachments", value: attachments.map(a => a.attachment).join("\n") }
            )
            break
        }
    }

    logPayload.embeds = [logEmbed]

    return await logChannel.send(logPayload).catch((e) => console.log(e))
}

functions.createWebhook = async function (msg) {
    let poopy = this
    let bot = poopy.bot
    let tempdata = poopy.tempdata
    let { Discord } = poopy.modules

    var isThread = msg.channel.type === Discord.ChannelType.PublicThread ||
        msg.channel.type === Discord.ChannelType.PrivateThread ||
        msg.channel.type === Discord.ChannelType.AnnouncementThread

    var channel = isThread ? msg.channel.parent : msg.channel

    if (!tempdata[msg.guild.id][channel.id]) tempdata[msg.guild.id][channel.id] = {}

    var webhooks = tempdata[msg.guild.id][channel.id].webhooks ?? await channel.fetchWebhooks().then(w => [...w.values()]).catch(() => [])
    tempdata[msg.guild.id][channel.id].webhooks = webhooks

    var findWebhooks = []

    if (webhooks?.length) findWebhooks = webhooks.filter(webhook => bot.user === webhook.owner)

    while (findWebhooks.length < Math.min(15 - webhooks.length, 5)) {
        var createdWebhook = await channel.createWebhook({
            name: `Poopyhook`,
            avatar: 'https://i.imgur.com/5e2sZpQ.png'
        }).catch(() => { })

        if (!createdWebhook) return

        created = true

        webhooks.push(createdWebhook)
        findWebhooks = webhooks.filter(webhook => bot.user === webhook.owner)
    }

    if (!findWebhooks.length) return

    return findWebhooks[Number(BigInt(msg.author.id) % BigInt(findWebhooks.length))]
}

functions.sendWebhook = async function (msg, payload) {
    let poopy = this
    let tempdata = poopy.tempdata
    let globaldata = poopy.globaldata
    let { createWebhook, createLog, rotAllAway } = poopy.functions
    let { Discord } = poopy.modules

    var err

    var webhook = await createWebhook(msg).catch(() => { })
    if (!webhook) return

    var isThread = msg.channel.type === Discord.ChannelType.PublicThread ||
        msg.channel.type === Discord.ChannelType.PrivateThread ||
        msg.channel.type === Discord.ChannelType.AnnouncementThread

    var channel = isThread ? msg.channel.parent : msg.channel

    if (isThread) payload.threadId = msg.channel.id
    payload = await rotAllAway(payload).catch(() => { })

    var webhookMsg = await webhook.send(payload).catch((e) => err = e)
    if (err) {
        if (err.message == "Unknown Webhook") {
            if (!tempdata[msg.guild.id][channel.id]) tempdata[msg.guild.id][channel.id] = {}
            tempdata[msg.guild.id][channel.id].webhooks = await channel.fetchWebhooks().then(w => [...w.values()]).catch(() => [])

            webhook = await createWebhook(msg).catch(() => { })
            if (webhook) webhookMsg = await webhook.send(payload)
        } else throw err
    }

    if (webhookMsg) {
        tempdata[msg.guild.id].webhookMembers[webhookMsg.id] = msg.member
        createLog("webhooks", msg.member, { payload, msg, webhookMsg }).catch((e) => console.log(e))
    }

    return webhookMsg
}

functions.createCronJob = async function (cronData) {
    let poopy = this
    let bot = poopy.bot
    let tempdata = poopy.tempdata
    let { cron, DummyMessage } = poopy.modules
    let { sleep, parseKeywords, fetchPingPerms, gatherData, deleteMsgData } = poopy.functions

    const timerId = cronData.id

    const guildId = cronData.guildId
    const guild = bot.guilds.cache.get(guildId)
        ?? await bot.guilds.fetch(guildId).catch(() => { })

    const channelId = cronData.channelId
    const channel = guild?.channels ? (
        guild.channels.cache.get(channelId)
        ?? await guild.channels.fetch(channelId).catch(() => { })
    ) : (
        bot.channels.cache.get(channelId)
        ?? await bot.channels.fetch(channelId).catch(() => { })
        ?? bot.users.cache.get(channelId)
        ?? await bot.users.fetch(channelId).catch(() => { })
    )

    const userId = cronData.userId ?? guild?.ownerId ?? bot.user.id
    const member = guild?.members ? (
        guild.members.cache.get(userId)
        ?? await guild.members.fetch(userId).catch(() => { })
        ?? guild.members.me
    ) : (
        bot.users.cache.get(userId)
        ?? await bot.users.fetch(userId).catch(() => { })
        ?? bot.user
    )

    const cronTime = cronData.cron
    const phrase = cronData.phrase
    const allowAnyPings = cronData.allowAnyPings

    const execute = async () => {
        if (!channel?.send) return

        let cronMessage
        let abort = false

        while (true) {
            const dummyMessage = new DummyMessage.Fake({
                poopy, guild, channel, member
            }, phrase)

            var dataError = false
            await gatherData(dummyMessage).catch((err) => dataError = err)
            if (dataError) return console.log(dataError)

            const evaluatedPhrase = await parseKeywords(phrase, dummyMessage, true, { resetAttempts: true }).catch(() => { }) ?? phrase

            if (evaluatedPhrase.trim()) cronMessage = await channel.send({
                content: evaluatedPhrase,
                allowedMentions: !allowAnyPings ? fetchPingPerms(dummyMessage) : undefined
            }).catch((err) => {
                if (!err.message.includes("discord.com")) abort = true
            })

            deleteMsgData(dummyMessage)

            if (!evaluatedPhrase.trim() || cronMessage || abort) break

            await sleep(5000)
        }
    }

    let job

    try {
        job = cron.CronJob.from({
            cronTime,
            onTick: execute,
            start: true,
            timeZone: "Etc/UTC"
        })
    } catch { }

    if (job) {
        if (tempdata.crons[timerId]) tempdata.crons[timerId].stop()
        tempdata.crons[timerId] = job
    }

    return job
}

functions.rateLimit = async function (msg) {
    let poopy = this
    let config = poopy.config
    let tempdata = poopy.tempdata
    let { infoPost } = poopy.functions

    if (!process.env.CLOUDAMQP_URL) return false
    tempdata[msg.author.id] ??= {}

    tempdata[msg.author.id].rateLimit = (tempdata[msg.author.id].rateLimit ?? 0) + 1
    setTimeout(() => tempdata[msg.author.id].rateLimit -= 1, 90000)

    if (tempdata[msg.author.id].rateLimit >= config.rateLimit) {
        tempdata[msg.author.id].rateLimits = (tempdata[msg.author.id].rateLimits ?? 0.5) * 2
        var rateLimitTime = config.rateLimitTime * tempdata[msg.author.id].rateLimits
        setTimeout(() => tempdata[msg.author.id].rateLimits -= 1, rateLimitTime * 2)

        await msg.reply(`you've been banned from using commands for ${rateLimitTime / 60000} minutes for crashing the file processor ${config.rateLimit * tempdata[msg.author.id].rateLimits} times LMAO!!!`).catch(() => { })
        infoPost(`${msg.author.id} was rate limited for ${rateLimitTime / 60000} minutes`).catch(() => { })
        tempdata[msg.author.id].rateLimited = Date.now() + rateLimitTime
        setTimeout(() => delete tempdata[msg.author.id].rateLimited, rateLimitTime)
        return true
    }

    return false
}

functions.deleteMsgData = function (msg) {
    let poopy = this
    let tempdata = poopy.tempdata

    if (!msg) return

    if (
        tempdata?.[msg?.author?.id]?.[msg?.id] &&
        (
            !tempdata[msg.author.id][msg.id].keyExecuting ||
            tempdata[msg.author.id][msg.id].keyExecuting <= 0
        )
    ) {
        delete tempdata[msg.author.id][msg.id]
    }
}

functions.dmSupport = function (msg) {
    let poopy = this
    let bot = poopy.bot

    let { Discord, DMGuild, Collection } = poopy.modules

    if (msg.channel?.type == Discord.ChannelType.DM && msg.channel?.recipients) msg.channel.type = Discord.ChannelType.GroupDM

    if (!msg.author && msg.user) msg.author = msg.user
    if (!msg.user && msg.author) msg.user = msg.author

    if ((
        (!msg.member || (msg.member && (!msg.member.displayAvatarURL)))
        && (msg.user || msg.author)
    )) Object.defineProperty(msg, 'member', {
        value: (msg.user || msg.author),
        writable: true
    })
    if (msg.member && (!msg.member.permissions || typeof msg.member.permissions == "string")) Object.defineProperty(msg.member, 'permissions', {
        value: { has: () => true },
        writable: true
    })

    if (!msg.channel) Object.defineProperty(msg, 'channel', {
        value: (msg.message?.channel) ?? (bot.user.channels && bot.user.channels.cache.get(msg.channelId)) ?? msg.author,
        writable: true
    })
    if (msg.channel && !msg.channel.sendTyping) Object.defineProperty(msg.channel, 'sendTyping', {
        value: async () => true,
        writable: true
    })
    if (msg.channel && !msg.channel.permissionsFor) Object.defineProperty(msg.channel, 'permissionsFor', {
        value: () => { return { has: () => true } },
        writable: true
    })

    if (!msg.guild) Object.defineProperty(msg, 'guild', {
        value: (msg.message?.guild) ?? ((msg.user || msg.author) && new DMGuild(msg)),
        writable: true
    })

    if (msg.channel && !msg.channel.guild && (msg.user || msg.author)) Object.defineProperty(msg.channel, 'guild', {
        value: new DMGuild(msg),
        writable: true
    })

    if (!msg.fetchWebhook) msg.fetchWebhook = async () => { }

    if (msg.channel && !msg.channel.fetchWebhooks) msg.channel.fetchWebhooks = async () => new Collection()
    if (msg.channel && !msg.channel.createWebhook) msg.channel.createWebhook = async () => { }
    if (msg.channel && !msg.channel.isDMBased) msg.channel.isDMBased = () => true
    if (msg.channel && !msg.channel.isTextBased) msg.channel.isTextBased = () => true
    if (msg.channel && !msg.channel.isThread) msg.channel.isThread = () => false
    if (msg.channel && !msg.channel.isVoiceBased) msg.channel.isVoiceBased = () => false

    if (msg.mentions) {
        if (!msg.mentions.members) Object.defineProperty(msg.mentions, 'members', {
            value: new Collection(msg.mentions.users ? msg.mentions.users.map(user => {
                if (!user.user) user.user = user
                return [user.id, user]
            }) : []),
            writable: true
        })

        if (!msg.mentions.users) Object.defineProperty(msg.mentions, 'users', {
            value: new Collection(msg.mentions.members ? msg.mentions.members.map(member => [member.user.id, member.user]) : []),
            writable: true
        })
    }

    if (msg.messageSnapshots?.size) {
        var snapshot = msg.messageSnapshots.first()

        msg.content = snapshot.content
        msg.attachments = snapshot.attachments
        msg.embeds = snapshot.embeds
        msg.stickers = snapshot.stickers
    }

    msg.isUserApp = !!(
        msg.authorizingIntegrationOwners ?
            (!msg.authorizingIntegrationOwners["0"] &&
                msg.authorizingIntegrationOwners["1"]) :
            false
    )
}

functions.msgSupport = function (obj, {
    content = "",
    attachments = {}
} = {}) {
    let poopy = this
    let { Collection } = poopy.modules

    class FakeCollector {
        constructor() {
            this.on = () => { }
            this.once = () => { }
            this.resetTimer = () => { }
            this.stop = () => { }
        }
    }

    obj.content ??= content
    obj.author ??= obj.user
    obj.bot ??= false
    obj.attachments ??= new Collection(Object.entries(attachments))
    obj.stickers ??= new Collection()
    obj.embeds ??= []
    obj.mentions ??= {
        users: new Collection(),
        members: new Collection(),
        users: new Collection(),
        roles: new Collection()
    }

    obj.edit ??= obj?.editReply ?? (async () => { })
    obj.delete ??= obj?.deleteReply ?? (async () => { })
    obj.react ??=
        obj.fetchWebhook =
        obj.fetchReference = async () => { }
    obj.createReactionCollector =
        obj.createMessageComponentCollector = () => new FakeCollector()
}

functions.escapeKeywordResult = async function (string) {
    if (!(typeof string === 'string' || string instanceof String)) return string
    return string
        .replace(/(?<!\\)\(/g, '\\\(')
        .replace(/(?<!\\)\)/g, '\\\)')
        .replace(/(?<!\\)\[/g, '\\\[')
        .replace(/(?<!\\)\]/g, '\\\]')
        .replace(/(?<!\\)\{/g, '\\\{')
        .replace(/(?<!\\)\}/g, '\\\}')
        .replace(/(?<!\\)\_/g, '\\\_')
        .replace(/(?<!\\)\"/g, '\\\"')
}

functions.getDeclaredObject = function (msg, obj, globalFirst) {
    let poopy = this
    let tempdata = poopy.tempdata

    if (globalFirst)
        return tempdata[msg.guild.id][msg.channel.id][obj] ?? tempdata[msg.author.id][msg.id][obj]
    else
        return tempdata[msg.author.id][msg.id][obj] ?? tempdata[msg.guild.id][msg.channel.id][obj]
}

functions.getDeclaredValue = function (msg, obj, value, globalFirst) {
    let poopy = this
    let tempdata = poopy.tempdata

    if (globalFirst)
        return tempdata[msg.guild.id][msg.channel.id][obj][value] ?? tempdata[msg.author.id][msg.id][obj][value]
    else
        return tempdata[msg.author.id][msg.id][obj][value] ?? tempdata[msg.guild.id][msg.channel.id][obj][value]
}

functions.cleanKeywords = function (string, msg) {
    let poopy = this
    let tempdata = poopy.tempdata
    let { getKeyFunc, infoPost } = poopy.functions

    var noProgressCount = 0
    var extraExecKeys, extraExecFuncs, keydata, lastString

    function declareExtraKeys() {
        extraExecKeys = {
            ...(tempdata[msg.guild?.id]?.[msg.channel?.id]?.keyDeclared ?? {}),
            ...(tempdata[msg.author?.id]?.[msg.id]?.keyDeclared ?? {})
        }
        extraExecFuncs = {
            ...(tempdata[msg.guild?.id]?.[msg.channel?.id]?.funcDeclared ?? {}),
            ...(tempdata[msg.author?.id]?.[msg.id]?.funcDeclared ?? {})
        }
    }

    declareExtraKeys()

    while (
        (keydata = getKeyFunc(string, {
            extraKeys: extraExecKeys,
            extraFuncs: extraExecFuncs
        }))
    ) {
        var keyMatch = keydata.match
        lastString = string

        string = string.replace(`${Array.isArray(keyMatch) ? `${keyMatch[0]}(${keyMatch[1]})` : keyMatch
            }`, "")

        declareExtraKeys()

        if (lastString == string) {
            noProgressCount++
            if (noProgressCount >= 5) {
                infoPost("Keyword cleaner made no progress 5 times, aborting to prevent infinite loop")
                return string
            }
        }
    }

    return string
}

functions.parseKeywords = async function (string, msg, isBot, { extraKeys = {}, extraFuncs = {}, resetAttempts = false, ownermode = false, declaredOnly = false, sourceMsg = undefined } = {}) {
    let poopy = this
    let config = poopy.config
    let vars = poopy.vars
    let special = poopy.special
    let data = poopy.data
    let tempdata = poopy.tempdata
    let globaldata = poopy.globaldata
    let { getKeyFunc, infoPost, equalValues,
        escapeKeywordResult, reconcileDataWithTemplate } = poopy.functions

    if (!tempdata[msg.author.id]) {
        tempdata[msg.author.id] = {}
    }

    if (!tempdata[msg.author.id][msg.id]) {
        tempdata[msg.author.id][msg.id] = {}
    }

    if (!tempdata[msg.author.id][msg.id].keyExecuting) {
        tempdata[msg.author.id][msg.id].keyExecuting = 0
    }
    tempdata[msg.author.id][msg.id].keyExecuting++

    if (!tempdata[msg.guild.id]) {
        tempdata[msg.guild.id] = {}
    }

    if (!tempdata[msg.guild.id][msg.channel.id]) {
        tempdata[msg.guild.id][msg.channel.id] = {}
    }

    try {
        var noProgressCount = 0
        var startTime = Date.now()
        var started = false

        var extraExecKeys, extraExecFuncs, keydata, lastString

        if (tempdata[msg.author.id].rateLimited || globaldata.shit.find(id => id === msg.author.id)) {
            return string
        }

        function declareExtraKeys() {
            var extraKeyDeclared = { ...tempdata[msg.guild.id][msg.channel.id].keyDeclared, ...tempdata[msg.author.id][msg.id].keyDeclared }
            var extraFuncDeclared = { ...tempdata[msg.guild.id][msg.channel.id].funcDeclared, ...tempdata[msg.author.id][msg.id].funcDeclared }

            extraExecKeys = declaredOnly ?
                { ...extraKeyDeclared } :
                { ...extraKeys, ...extraKeyDeclared }

            extraExecFuncs = declaredOnly ?
                { ...extraFuncDeclared } :
                { ...extraFuncs, ...extraFuncDeclared }
        }

        declareExtraKeys()

        while (
            (keydata = getKeyFunc(string, {
                extraKeys: extraExecKeys,
                extraFuncs: extraExecFuncs,
                declaredOnly: declaredOnly
            })) && tempdata[msg.author.id][msg.id]?.returnValue == undefined
            && (
                tempdata[msg.guild.id][msg.channel.id]?.returnValue == undefined ||
                (keydata?.type == "func" && keydata?.match?.[0] == "startkeyexec")
            )
        ) {
            lastString = string

            if (!started || !tempdata[msg.author.id][msg.id] || !tempdata[msg.guild.id][msg.channel.id]) {
                if (!tempdata[msg.author.id][msg.id]) {
                    tempdata[msg.author.id][msg.id] = {}
                }

                reconcileDataWithTemplate(tempdata[msg.author.id][msg.id], vars.tempdataTemplate.userId.messageId)

                if (!tempdata[msg.guild.id][msg.channel.id]) {
                    tempdata[msg.guild.id][msg.channel.id] = {}
                }

                reconcileDataWithTemplate(tempdata[msg.guild.id][msg.channel.id], vars.tempdataTemplate.guildId.channelId, msg)

                started = true
            }

            if (
                tempdata[msg.author.id].rateLimited || globaldata.shit.find(id => id === msg.author.id) || (
                    tempdata[msg.author.id][msg.id].keyAttempts >= config.keyLimit && !ownermode
                )
            ) {
                return string
            }

            var opts = {
                extraKeys: extraExecKeys,
                extraFuncs: extraExecFuncs,
                ownermode: ownermode,
                sourceMsg: sourceMsg
            }

            switch (keydata.type) {
                case 'key':
                    var keyName = keydata.match
                    var key = special.keys[keyName] || extraExecKeys[keyName]
                    var keyCut = keyName
                    if (key === undefined) var keyCut = keyName.substring(1); key = special.keys[keyCut] || extraExecKeys[keyCut]

                    if (!ownermode && (key.limit != undefined && equalValues(tempdata[msg.author.id][msg.id].keywordsExecuted, keyName) >= key.limit) ||
                        (key.cmdconnected && data.guildData[msg.guild.id]?.disabled.find(cmd => cmd.find(n => n === key.cmdconnected)))) {
                        string = string.replace(keyName, '')
                        break
                    }

                    tempdata[msg.author.id][msg.id].keywordsExecuted.push(keyName)

                    var change
                    tempdata[msg.author.id][msg.id].keyAttempts += !data.guildData[msg.guild.id].chaos ? (key.attemptvalue ?? 1) : 0

                    try {
                        var doEscape = keyCut !== keyName
                        var result = await key.func.call(poopy, msg, isBot, string, opts)

                        change = doEscape ? await escapeKeywordResult(result) : result
                    } catch (e) {
                        console.log(e)
                        change = ''
                    }

                    var replaceAllContent = typeof (change) === 'object' && change[1] === true
                    change = replaceAllContent ? String(change[0]) : String(change)

                    if (vars.currentIpAddress && change.includes(vars.currentIpAddress)) {
                        change = ''
                    }

                    string = replaceAllContent ? change : string.replace(keydata.match, change.replace(/\$&/g, '$\\&'))
                    break

                case 'func':
                    var [funcName, match] = keydata.match
                    var func = special.functions[funcName] || extraExecFuncs[funcName]
                    var funcCut = funcName
                    if (func === undefined) funcCut = funcName.substring(0, funcName.length - 1); func = special.functions[funcCut] || extraExecFuncs[funcCut]
                    var m = match

                    if (!ownermode && (func.limit != undefined && equalValues(tempdata[msg.author.id][msg.id].keywordsExecuted, funcName) >= func.limit) ||
                        (func.cmdconnected && data.guildData[msg.guild.id]?.disabled.find(cmd => cmd.find(n => n === func.cmdconnected)))) {
                        string = string.replace(`${funcName}(${match})`, '')
                        break
                    }

                    tempdata[msg.author.id][msg.id].keywordsExecuted.push(funcName)

                    match = match.replace(/\\\)/g, ')')
                    if (!func.raw) {
                        string = string.replace(m, match)
                    }

                    var change
                    tempdata[msg.author.id][msg.id].keyAttempts += !data.guildData[msg.guild.id].chaos ? (func.attemptvalue ?? 1) : 0

                    try {
                        var doEscape = funcCut !== funcName
                        var result = await func.func.call(poopy, [funcName, match], msg, isBot, string, opts)

                        change = doEscape ? await escapeKeywordResult(result) : result
                    } catch (e) {
                        console.log(e)
                        change = ''
                    }

                    var replaceAllContent = typeof (change) === 'object' && change[1] === true
                    change = replaceAllContent ? String(change[0]) : String(change)

                    if (vars.currentIpAddress && change.includes(vars.currentIpAddress)) {
                        change = ''
                    }

                    string = replaceAllContent ? change : string.replace(`${funcName}(${match})`, change.replace(/\$&/g, '$\\&'))
                    break
            }

            declareExtraKeys()

            if (lastString == string) {
                noProgressCount++
                if (noProgressCount >= 5) {
                    infoPost("Keyword parser made no progress 5 times, aborting to prevent infinite loop")
                    return string
                }
            }
        }

        if (resetAttempts) {
            if (tempdata[msg.author.id][msg.id].keywordsExecuted) {
                if (tempdata[msg.author.id][msg.id].keywordsExecuted.length) {
                    infoPost(`Took ${(Date.now() - startTime) / 1000} seconds to execute keywords/functions: ${tempdata[msg.author.id][msg.id].keywordsExecuted.map(k => `\`${k}\``).join(', ')}`)
                }
                tempdata[msg.author.id][msg.id].keywordsExecuted = []
            }
        }

        if (tempdata[msg.author.id][msg.id].returnValue != undefined) {
            string = tempdata[msg.author.id][msg.id].returnValue
            delete tempdata[msg.author.id][msg.id].returnValue
        }

        if (tempdata[msg.guild.id][msg.channel.id].returnValue != undefined && started) {
            string = tempdata[msg.guild.id][msg.channel.id].returnValue
        }

        if (tempdata[msg.author.id][msg.id].keyExecuting) {
            tempdata[msg.author.id][msg.id].keyExecuting--
        }

        return string
    } catch (e) {
        if (tempdata[msg.author.id][msg.id].keyExecuting) {
            tempdata[msg.author.id][msg.id].keyExecuting--
        }

        console.log(e)
        throw e
    }
}

functions.getLevel = function (exp) {
    let poopy = this
    let vars = poopy.vars

    if (exp > Number.MAX_SAFE_INTEGER) exp = Number.MAX_SAFE_INTEGER

    let lastLevel = 0
    let level = 0
    while (exp >= vars.battleStats.exp * (lastLevel + 1)) {
        exp -= vars.battleStats.exp * (lastLevel + 1)
        lastLevel = level
        level++
    }

    return { level, exp, required: vars.battleStats.exp * (lastLevel + 1) }
}

functions.processSubjDeath = function (subjId, subjData, otherSubjId, otherSubjData, attacked, critmult, chance) {
    let poopy = this
    let bot = poopy.bot
    let { getLevel } = poopy.functions

    var isPoopy = subjId == bot.user.id || otherSubjId == bot.user.id
    var subjIsYou = subjId == otherSubjId

    var power = subjId && Math.round(
        (subjData.maxHealth + subjData.attack + subjData.defense + subjData.accuracy + subjData.loot) / 5
        * 10) / 10

    var exp = 0
    var reward = 0
    var died = false

    if (attacked && !isPoopy && !subjIsYou && subjId)
        exp = Math.floor(Math.random() * subjData.maxHealth / 5) +
            subjData.maxHealth / 20 +
            (otherSubjData.loot * 10)
            * critmult
            * (Math.pow(getLevel(subjData.exp).level, 2) / 50)
            * Math.round(1 / chance)

    if (subjData.health <= 0) {
        subjData.health = 0
        subjData.death = Date.now() + 30_000
        died = true

        if (subjId) {
            subjData.bucks = Math.floor(subjData.bucks * 0.8)
            subjData.deaths++
            if (!isPoopy && !subjIsYou) {
                exp *= 50
                reward = Math.floor(exp / 75 * power * (otherSubjData.loot / 10 + 1))
            }

            otherSubjData.kills++
        }
    }

    otherSubjData.exp += exp
    otherSubjData.bucks += reward

    return [died, exp, reward]
}

functions.dealDamage = function (damage, subjUser, subjData, subjShield, subjShieldUp, otherSubjUser, otherSubjData, otherSubjShield, otherSubjShieldUp, loopDepth, critmult, chance) {
    let poopy = this
    let data = poopy.data
    let { dealDamage, processSubjDeath } = poopy.functions

    loopDepth++

    if (loopDepth > 10)
        return [0, 0, [false, 0, 0], [false, 0, 0]]

    var subjId = subjUser && subjUser.id
    var otherSubjId = otherSubjUser && otherSubjUser.id

    var damageReduction = 0
    var damageRedirect = 0

    damageReduction += subjId ? subjData.defense / 50 : 0

    if (otherSubjShield && otherSubjShieldUp && otherSubjShield.stats.attackReduction)
        damageReduction += otherSubjShield.stats.attackReduction

    if (subjShield && subjShieldUp && subjShield.stats.damageReduction)
        damageReduction += subjShield.stats.damageReduction

    if (subjShield && subjShieldUp && subjShield.stats.damageRedirect)
        damageRedirect += subjShield.stats.damageRedirect

    damage = Math.max(Math.round(
        damage * (1 - damageReduction)
        * 10) / 10, 1)

    var redirectedDamage = Math.max(Math.round(
        damage * damageRedirect
        * 10) / 10, 0)

    var subjDamageDealt = damage
    var otherSubjDamageDealt = redirectedDamage

    subjData.health -= damage

    if (redirectedDamage != 0 && subjData.health + damage > 0) {
        var [redirectedDamageDealt, redirectedSquaredDamage] = dealDamage(
            redirectedDamage,
            otherSubjUser, otherSubjData, otherSubjShield, otherSubjShieldUp,
            subjUser, subjData, subjShield, subjShieldUp,
            loopDepth, critmult, chance
        )

        subjDamageDealt += redirectedSquaredDamage
        otherSubjDamageDealt = redirectedDamageDealt
    }

    var subjDeathArray = [false, 0, 0]
    var otherSubjDeathArray = [false, 0, 0]

    if (loopDepth == 1) {
        subjDeathArray = processSubjDeath(
            subjId, subjData, otherSubjId, otherSubjData, true, critmult, chance
        )
        otherSubjDeathArray = processSubjDeath(
            otherSubjId, otherSubjData, subjId, subjData, otherSubjDamageDealt > 0, 1, 1
        )
    }

    if (otherSubjId) {
        data.botData.leaderboard[otherSubjId] ??= {}

        data.botData.leaderboard[otherSubjId].tag = otherSubjUser.tag ?? otherSubjUser.user?.tag ?? data.botData.leaderboard[otherSubjId].tag ?? otherSubjUser.id
        data.botData.leaderboard[otherSubjId].bucks = otherSubjData.bucks ?? 20
    }

    if (subjId) {
        data.botData.leaderboard[subjId] ??= {}

        data.botData.leaderboard[subjId].tag = subjUser.tag ?? subjUser.user?.tag ?? data.botData.leaderboard[subjId].tag ?? subjUser.id
        data.botData.leaderboard[subjId].bucks = subjData.bucks ?? 20
    }

    return [subjDamageDealt, otherSubjDamageDealt, subjDeathArray, otherSubjDeathArray]
}

functions.battle = async function (msg, subject, action, damage, chance) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let data = poopy.data
    let tempdata = poopy.tempdata
    let vars = poopy.vars
    let {
        getLevel, fetchPingPerms, validateFile, dataGather,
        getShieldById, battleGif, dealDamage, resolveUser,
        pronouns
    } = poopy.functions
    let { Discord } = poopy.modules

    msg.channel.sendTyping().catch(() => { })
    var attachment = msg.attachments?.first?.()?.url
    var sticker = msg.stickers?.[0]?.url

    if (!subject && !attachment && !sticker) {
        await msg.reply('What/who is the subject?!').catch(() => { })
        return;
    };

    subject = subject ?? attachment ?? sticker

    var yourUser = msg.author
    var subjUser = await resolveUser(subject, msg.guild, "user").catch(() => { })

    var yourId = yourUser.id
    var subjId = subjUser && subjUser.id

    var isPoopy = subjId == bot.user.id

    if (isPoopy) {
        subjUser = yourUser
        yourUser = bot.user

        subjId = subjUser.id
        yourId = yourUser.id
        damage = Number.MAX_SAFE_INTEGER
    }

    var subjGuildMember = subjId && await msg.guild.members.fetch(subjId).catch(() => { })
    var yourGuildMember = await msg.guild.members.fetch(yourId).catch(() => { })

    var yourData = data.userData[yourId]

    var subjData = subjUser && (
        data.userData[subjId] ||
        (
            data.userData[subjId] = !config.testing && process.env.MONGODB_URL && await dataGather.userData(config.database, subjId).catch(() => { }) || vars.dataTemplate.userData.userId
        )
    )

    if (subjUser) data.userData[subjId].username = subjUser.displayName

    var yourShield = yourData && getShieldById(yourData.shieldEquipped)
    var subjShield = subjData && getShieldById(subjData.shieldEquipped)

    var yourShieldUp = yourData && yourData.shielded
    var subjShieldUp = subjData && subjData.shielded

    if (subjUser) {
        var yourBlock = (yourData.blocked ?? []).find(u => u.id == subjId)
        var subjBlock = (subjData.blocked ?? []).find(u => u.id == yourId)

        var blockPhrase = yourBlock && subjBlock ? "you blocked each other" :
            yourBlock ? "you blocked them" : "they blocked you"

        if (yourBlock || subjBlock) {
            await msg.reply(`You can't attack **${subjUser.displayName.replace(/\@/g, '@‌')}** because **${blockPhrase}**.`).catch(() => { })
            return
        }
    }

    var fakeSubj = !subjUser && !subjGuildMember
    var fakeSubjData = fakeSubj && (
        tempdata[`fakeSubj${subject}`] ||
        (
            tempdata[`fakeSubj${subject}`] = { health: 100, maxHealth: 100, death: 0 }
        )
    )

    for (var dt of [[yourData, yourUser], [subjData, subjUser], [fakeSubjData, undefined]]) {
        var battleData = dt[0]
        var battleUser = dt[1]

        if (battleData && battleData.death) {
            if (battleData.death - Date.now() > 0) {
                var pronoun = battleUser == yourUser ? 'you' :
                    battleUser ? (await pronouns(battleUser, msg.guild))[0] : 'it'

                switch (pronoun) {
                    case 'they':
                        pronoun = "they're"
                        break

                    case 'he':
                        pronoun = "he's"
                        break

                    case 'she':
                        pronoun = "she's"
                        break

                    case 'it':
                        pronoun = "it's"
                        break

                    case 'you':
                        pronoun = "you're"
                        break
                }

                await msg.reply(`But ${pronoun} dead.`).catch(() => { })
                return
            } else {
                battleData.health = battleData.maxHealth
                delete battleData.death
            }
        }
    }

    let attacked = isPoopy || (Math.random() < chance + (yourData.accuracy * 0.1))
    let critical = isPoopy || (attacked && Math.random() < 0.1 + (yourData.accuracy * 0.05))
    let critmult = critical ? Math.floor(Math.random() * 3) + 2 : 1

    damage += Math.floor(Math.random() * (yourData.attack + 1)) * 2
    if (critical) damage *= critmult

    var subjDied = false
    var subjExp = 0
    var subjReward = 0

    var youDied = false
    var yourExp = 0
    var yourReward = 0

    var youGotHit = false
    var gotDamaged = 0

    if (subjUser && subjData) {
        for (var stat in vars.battleStats) {
            var statValue = vars.battleStats[stat]
            if (subjData[stat] === undefined) {
                subjData[stat] = typeof statValue == "object" ? structuredClone(statValue) : statValue
            }
        }
        subjData.battleSprites ??= {}
    }

    var subjLastBucks = subjData ? subjData.bucks : 20
    var yourLastBucks = yourData ? yourData.bucks : 20
    var subjLastLevel = subjData ? getLevel(subjData.exp).level : 0
    var yourLastLevel = yourData ? getLevel(yourData.exp).level : 0

    if (attacked) {
        var thisSubjData = subjUser ? subjData : fakeSubjData

        var [damageDealt, damageReceived, subjDeathArray, yourDeathArray] = dealDamage(
            damage,
            subjUser, thisSubjData, subjShield, subjShieldUp,
            yourUser, yourData, yourShield, yourShieldUp,
            0, critmult, chance
        );

        [subjDied, yourExp, yourReward] = subjDeathArray;
        [youDied, subjExp, subjReward] = yourDeathArray;

        gotDamaged = damageReceived
        youGotHit = gotDamaged > 0

        damage = damageDealt
    }

    var subjIsYou = subjId == yourId

    var subjBucks = subjData ? subjData.bucks : 20
    var yourBucks = yourData ? yourData.bucks : 20
    var subjLevel = subjData ? getLevel(subjData.exp).level : 0
    var yourLevel = yourData ? getLevel(yourData.exp).level : 0

    var yourName = yourUser.displayName
    var subjName = (subjUser && subjUser.displayName) ?? subject ?? 'this'

    var subjPronoun = subjUser ? (await pronouns(subjUser, msg.guild))[0] : 'it'
    var subjPronounCapperCase = subjPronoun.toCapperCase()
    var subjHave = subjPronoun == 'they' ? 'have' : 'has'

    var actions = []

    if (critical) actions.push('***CRITICAL HIT!***')
    actions.push(
        action
            .replace('{src}', yourName)
            .replace('{trgt}', subjName)
            .replace('{dmg}', damage)
    )

    if (youGotHit) actions.push(`**${subjName}** hit you back for **${gotDamaged}** damage!`)

    if ((youDied && !isPoopy) || (subjDied && isPoopy)) actions.push('You have died.')
    if ((subjDied && !isPoopy) || (youDied && isPoopy)) actions.push(subjIsYou ? 'Congratulations.' : `${subjPronounCapperCase} ${subjHave} died.`)
    if (yourLevel > yourLastLevel) actions.push(`You leveled UP!`)
    if (subjLevel > subjLastLevel) actions.push(`${subjPronounCapperCase} leveled UP!`)

    var stats = []

    if ((subjUser && subjData) || (fakeSubj && fakeSubjData)) {
        var yourShieldedString = yourShield && yourShieldUp && ` (${yourShield.name})` || ""
        var subjShieldedString = subjShield && subjShieldUp && ` (${subjShield.name})` || ""

        stats.push({
            name: `${yourName}'s Health${yourShieldedString}`,
            value: `${yourData.health.toFixed(1).replace(/\.0+$/, "")} HP`,
            inline: true
        })

        if (subjId ? subjId != yourId : fakeSubj)
            stats.push({
                name: `${subjName}'s Health${subjShieldedString}`,
                value: `${(subjData ? subjData : fakeSubjData).health.toFixed(1).replace(/\.0+$/, "")} HP`,
                inline: true
            })
    }

    function formatNumber(number) {
        var formattedNumber = number.toFixed(2)
        if (formattedNumber.includes('.'))
            formattedNumber = formattedNumber.replace(/0+$/, '').replace(/\.$/, '')

        return formattedNumber
    }

    if (yourExp) {
        stats.push({
            name: `${yourName}'s Experience`,
            value: `+${formatNumber(yourExp)} XP`,
            inline: true
        })
    }

    if (subjDied && yourReward) {
        stats.push({
            name: `${yourName}'s Reward`,
            value: `+${formatNumber(yourReward)} P$`,
            inline: true
        })
    }

    if (yourLevel > yourLastLevel) {
        stats.push({
            name: `${yourName}'s Level`,
            value: `${yourLastLevel} -> **${yourLevel}**`,
            inline: true
        })
    }

    if (yourLastBucks != yourBucks) {
        stats.push({
            name: `${yourName}'s Money`,
            value: `${formatNumber(yourLastBucks)} P$ -> **${formatNumber(yourBucks)}** P$`,
            inline: true
        })
    }

    if (subjExp && !subjIsYou) {
        stats.push({
            name: `${subjName}'s Experience`,
            value: `+${formatNumber(subjExp)} XP`,
            inline: true
        })
    }

    if (youDied && subjReward && !subjIsYou) {
        stats.push({
            name: `${subjName}'s Reward`,
            value: `+${formatNumber(subjReward)} P$`,
            inline: true
        })
    }

    if (subjLevel > subjLastLevel && !subjIsYou) {
        stats.push({
            name: `${subjName}'s Level`,
            value: `${formatNumber(subjLastLevel)} -> **${formatNumber(subjLevel)}**`,
            inline: true
        })
    }

    if (subjLastBucks != subjBucks && !subjIsYou) {
        stats.push({
            name: `${subjName}'s Money`,
            value: `${formatNumber(subjLastBucks)} P$ -> **${formatNumber(subjBucks)}** P$`,
            inline: true
        })
    }

    var payload = {
        embeds: [{
            description: attacked ? actions.join(' ') : 'You missed!',
            color: 0x472604,
            fields: stats,
            footer: {
                icon_url: bot.user.displayAvatarURL({
                    dynamic: true, size: 1024, extension: 'png'
                }),
                text: bot.user.displayName
            },
        }],
        content: `${attacked ? actions.join(' ') : 'You missed!'}${stats.length ? `\n\n${stats.map(s => `**${s.name}**: ${s.value}`).join('\n')}` : ''}`,
        allowedMentions: fetchPingPerms(msg)
    }

    payload.files = []

    if ((subjUser && subjData) || (vars.validUrl.test(subject) && (await validateFile(subject).catch(() => { })))) {
        var filepath = await battleGif(subject, subjData, subjGuildMember ?? subjUser, attacked, subjDied, critical, subjShieldUp, subjShield)

        if (fs.existsSync(`${filepath}/attack.gif`)) {
            payload.files.push(new Discord.AttachmentBuilder(`${filepath}/attack.gif`))
            payload.embeds[0].image = { url: 'attachment://attack.gif' }
        }
    }

    if (youGotHit && !subjIsYou) {
        var filepath2 = await battleGif(subject, yourData, yourGuildMember ?? yourUser, true, youDied, false, yourShieldUp, yourShield, 'attack2.gif')

        if (fs.existsSync(`${filepath2}/attack2.gif`)) {
            payload.files.push(new Discord.AttachmentBuilder(`${filepath2}/attack2.gif`))
            payload.embeds.push({
                color: 0x472604,
                image: { url: 'attachment://attack2.gif' },
                footer: {
                    icon_url: bot.user.displayAvatarURL({
                        dynamic: true, size: 1024, extension: 'png'
                    }),
                    text: bot.user.displayName
                },
            })
        }
    }

    if (config.textEmbeds) delete payload.embeds
    else delete payload.content

    if (!msg.nosend) await msg.reply(payload).catch(() => { })

    if (filepath && fs.existsSync(filepath)) fs.rm(filepath, { force: true, recursive: true })

    return attacked ? actions.join(' ') : 'You missed!'
}

functions.battleGif = async function (subject, subjData, member, attacked, died, critical, subjShieldUp, subjShield, fileName) {
    let poopy = this
    let { downloadFile, randomNumber, randomChoice,
        execPromise } = poopy.functions

    var correctBattleSprite = died ? 'dead' : attacked ? 'hurt' : 'miss'

    fileName = fileName ?? 'attack.gif'

    var avatar = member ? (subjData.battleSprites[correctBattleSprite] ?? member.displayAvatarURL({
        dynamic: true, size: 256, extension: 'png'
    })) : subject

    var subjShieldFileName = subjShield && `${subjShield.id}.png`
    var subjShieldImagePath = subjShield && `assets/image/shields/${subjShieldFileName}`

    var filepath = await downloadFile(avatar, 'avatar.png')

    var spazz = () => `+(random(t+${Math.floor(Math.random() * 1000)})*2-1)*(0.4-mod(t,0.4))*15`
    var bossX = () => `+cos(PI/2*((t+${i + 1}*0.4)/0.4))*10`
    var bossY = () => `+sin(PI*((t+${i + 1}*0.4)/0.4))*10`

    var attackPositions = new Array(4).fill().map(() =>
        attacked ?
            [
                randomNumber(50, 150),
                randomNumber(25, 125)
            ] :
            [
                randomChoice([
                    randomNumber(0, 25), randomNumber(175, 200)
                ]),
                randomChoice([
                    randomNumber(0, 25), randomNumber(125, 150)
                ])
            ]
    )
    var attackOverlayFilters = []
    var resultSymbols = []
    var enemySymbols = []
    var shieldSymbols = []

    var showShield = subjShieldUp && subjShieldImagePath && attacked

    for (var i in attackPositions) {
        i = Number(i)
        var attackPosition = attackPositions[i]
        var attackX = attackPosition[0]
        var attackY = attackPosition[1]

        var isOdd = i % 2 != 0
        var doFlip = !attacked && isOdd

        var attackGifSymbol = `[1:v]`
        var backgroundImageSymbol = `[2:v]`
        var shieldImageSymbol = `[shield${i}]`
        var enemySymbol = `[en${i}]`
        var enemyFlippedSymbol = `[enf${i}]`
        var enemyOffsetSymbol = `[shake${i}]`
        var enemyShieldOverlaidSymbol = `[enshield${i}]`
        var finalSymbol = `[attack${i}]`

        var enemySymbolSwitchOnFlip = doFlip ? enemyFlippedSymbol : enemySymbol
        var preAttackGifOverlaySymbol = enemyOffsetSymbol

        var xAdd = attacked ? spazz() : bossX(i)
        var yAdd = attacked ? spazz() : bossY(i)

        var yDeathAdd = died ? `+t*40+(40*${i})` : ''

        var shieldFilter = `${enemyOffsetSymbol}${shieldImageSymbol}overlay=` +
            `x='(W-w)/2-25${xAdd}':` +
            `y='(H-h)/2+30${yAdd}${yDeathAdd}':` +
            `format=auto${enemyShieldOverlaidSymbol};`

        if (showShield)
            preAttackGifOverlaySymbol = enemyShieldOverlaidSymbol

        attackOverlayFilters.push(`${doFlip ? `${enemySymbol}hflip${enemyFlippedSymbol};` : ''}` +
            `${backgroundImageSymbol}${enemySymbolSwitchOnFlip}overlay=` +
            `x='(W-w)/2${xAdd}':` +
            `y='(H-h)/2${yAdd}${yDeathAdd}':` +
            `format=auto${enemyOffsetSymbol};` +
            (showShield ? shieldFilter : '') +
            `${preAttackGifOverlaySymbol}${attackGifSymbol}overlay=` +
            `shortest=1:` +
            `x=${attackX}-w/2:` +
            `y=${attackY}-h/2:` +
            `format=auto${finalSymbol}`
        )

        resultSymbols.push(finalSymbol)
        enemySymbols.push(enemySymbol)
        shieldSymbols.push(shieldImageSymbol)
    }

    var attackGifPrefix = 'assets/image/' + (critical ? 'crit' : '')

    var shieldInput = `-stream_loop -1 -i ${subjShieldImagePath} `
    var shieldSplit = `[3:v]scale=75:75:force_original_aspect_ratio=decrease,` +
        `split=${shieldSymbols.length}${shieldSymbols.join('')};`

    await execPromise(`ffmpeg -stream_loop -1 ` +
        `-i ${filepath}/avatar.png ` +
        `-i ${attackGifPrefix}attack.gif ` +
        `-stream_loop -1 ` +
        `-f lavfi -i "color=0x00000000:s=200x150,format=rgba" ` +
        (showShield ? shieldInput : '') +
        `-filter_complex ` +
        `"[0:v]scale=100:100:force_original_aspect_ratio=decrease,` +
        `split=${enemySymbols.length}${enemySymbols.join('')};` +
        (showShield ? shieldSplit : '') +
        `${attackOverlayFilters.join(';')};` +
        `${resultSymbols.join('')}concat=n=${resultSymbols.length},` +
        `split[pout][ppout];` +
        `[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" ` +
        `-map "[out]" -preset ultrafast -gifflags -offsetting ` +
        `${filepath}/${fileName}`)

    return filepath
}

functions.userToken = function (id, token) {
    let poopy = this
    let data = poopy.data
    let { randomChoice, decrypt, randomKey } = poopy.functions

    var tokens = data.userData[id].tokens[token] ?? []
    var userTkn = randomChoice(tokens)

    return userTkn ? decrypt(userTkn) : randomKey(token)
}

functions.processQueue = async function (queue, interval = 15000) {
    if (queue.active || queue.jobs.length === 0) return
    queue.active = true

    const job = queue.jobs.shift()
    await job()

    setTimeout(() => {
        queue.active = false
        functions.processQueue(queue, interval)
    }, interval + Math.floor(Math.random() * 800))
}

functions.enqueue = function (queue, fn, interval = 15000) {
    return new Promise(resolve => {
        queue.jobs.push(async () => resolve(await fn()))
        functions.processQueue(queue, interval)
    })
}

const imgQueries = Object.fromEntries(["google", "startpage", "duckduckgo"].map(
    (provider) => [provider, {
        cooldown: false,
        active: false,
        jobs: [],
        images: {}
    }]
))

const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0"
    }
})

functions.downloadFile = async function (url, filename, options) {
    let poopy = this
    let config = poopy.config
    let vars = poopy.vars
    let tempfiles = poopy.tempfiles
    let tempdata = poopy.tempdata
    let { infoPost, execPromise, cleanFileInfoUrl } = poopy.functions
    let { fs, axios } = poopy.modules

    url = url || ' '
    options = options || {}
    var filepath
    var ffmpegUsed = false

    if (options.filepath) {
        filepath = options.filepath
    } else {
        var currentcount = vars.filecount
        vars.filecount++
        fs.mkdirSync(`temp/${config.database}/file${currentcount}`)
        filepath = `temp/${config.database}/file${currentcount}`
    }

    async function ffmpeg() {
        ffmpegUsed = true
        infoPost(`Downloading file through FFmpeg with name \`${filename}\``)
        if (options.fileinfo) {
            await execPromise(`ffmpeg -i "${url}"${options.ffmpegstring ? ` ${options.ffmpegstring}` : options.fileinfo.shortext === 'gif' ? ` -filter_complex "[0:v]split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -gifflags -offsetting` : options.fileinfo.shortext === 'png' ? ' -pix_fmt rgba' : options.fileinfo.shortext === 'mp4' ? ' -c:v libx264 -pix_fmt yuv420p' : options.fileinfo.shortext === 'mp3' ? ' -c:a libmp3lame' : ''} ${filepath}/${filename}`)
        } else {
            await execPromise(`ffmpeg -i "${url}"${options.ffmpegstring ? ` ${options.ffmpegstring}` : ''} ${filepath}/${filename}`)
        }
    }

    var hasTempFile = false

    if (!options.buffer) {
        var fileInfoUrl = cleanFileInfoUrl(url)
        var validatedFile = tempdata.validatedFiles[fileInfoUrl]
        var fileInfo = validatedFile?.fileInfo

        if (url.startsWith('temp:')) {
            options.buffer = true
            url = fs.readFileSync(`tempfiles/${config.database}/${tempfiles[url.substring(5)].name}`)
        } else if (fileInfo && fs.existsSync(fileInfo.path)) {
            hasTempFile = true
            if (!options.fileinfo) options.fileinfo = fileInfo
            url = fileInfo.path
        }
    }

    var isSameInfo = !(options.fileinfo) ? true : ((options.fileinfo.shortext === options.fileinfo.type.ext) && (options.fileinfo.shortpixfmt === options.fileinfo.info.pixfmt))

    if (options.buffer || (hasTempFile && isSameInfo)) {
        infoPost(`Downloading file through buffer with name \`${filename}\``)
        fs.writeFileSync(`${filepath}/${filename}`, options.buffer ? url : options.fileinfo.buffer)
    } else if ((isSameInfo || options.http) && !(options.ffmpeg)) {
        infoPost(`Downloading file through URL with name \`${filename}\``)
        var response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer'
        }).catch(() => { })

        if (response) {
            fs.writeFileSync(`${filepath}/${filename}`, response.data)
        }
    } else {
        await ffmpeg()
    }

    if (options.convert && !ffmpegUsed) {
        await ffmpeg()
    }

    infoPost(`Successfully downloaded \`${filename}\` in \`${filepath}\``)

    return filepath
}

functions.sendFile = async function (msg, filepath, filename, extraOptions) {
    let poopy = this
    let config = poopy.config
    let data = poopy.data
    let tempfiles = poopy.tempfiles
    let vars = poopy.vars
    let {
        validateFileFromPath, execPromise, infoPost,
        rateLimit, addLastUrl, generateId, fetchPingPerms,
        getUploadLimit
    } = poopy.functions
    let { fs, Discord, HTTPClientUtils } = poopy.modules

    extraOptions = extraOptions || {}

    var returnUrl

    var prefix = data.guildData[msg.guild.id].prefix
    var args = msg.content.substring(prefix.toLowerCase().length).split(' ')

    var fileBuffer

    try {
        fileBuffer = fs.readFileSync(`${filepath}/${filename}`)
    } catch (_) {
        await msg.reply('Couldn\'t send file.').catch(() => { })
        infoPost(`Couldn\'t send file`)
        await rateLimit(msg)

        if (extraOptions.keep ||
            filepath == undefined ||
            filepath.startsWith('tempfiles')) return

        fs.rm(filepath, { force: true, recursive: true })
        return
    }

    var tooLarge = fileBuffer.length > getUploadLimit(msg)

    extraOptions.catbox = extraOptions.catbox ?? args.includes('-catbox')
    extraOptions.nosend = extraOptions.nosend ?? msg.nosend ?? args.includes('-nosend')
    extraOptions.nocompress = extraOptions.nocompress ?? args.includes('-nocompress')
    extraOptions.forcecompress = extraOptions.forcecompress ?? args.includes('-forcecompress')

    var compress = ((tooLarge && !extraOptions.catbox && !extraOptions.nosend) && !extraOptions.nocompress)
        || (extraOptions.forcecompress && fileBuffer.length > 1024 * 1024 * 10)

    if (compress) {
        if (!extraOptions.nosend && !extraOptions.forcecompress) await msg.reply('Output file too large to be sent to channel, so I\'m gonna try to compress it...\n-# (...unless you didn\'t want this, then you can specify `-nocompress` next time)').catch(() => { })
        var fileinfo = await validateFileFromPath(`${filepath}/${filename}`, 'very true').catch(() => { })

        if (!fileinfo) {
            await msg.reply('Couldn\'t send file.').catch(() => { })
            infoPost(`Couldn\'t send file`)
            await rateLimit(msg)

            if (extraOptions.keep ||
                filepath == undefined ||
                filepath.startsWith('tempfiles')) return

            fs.rm(filepath, { force: true, recursive: true })
            return
        }

        var size = fs.readFileSync(`${filepath}/${filename}`).length
        var tries = 1
        while (size > getUploadLimit(msg) && tries <= 5) {
            fs.renameSync(`${filepath}/${filename}`, `${filepath}/compress_${filename}`)

            switch (fileinfo.shorttype) {
                case 'image':
                    await execPromise(`ffmpeg -i ${filepath}/compress_${filename} -vf "scale=iw*${1 / (tries * 0.5 + 1)}:ih*${1 / (tries * 0.5 + 1)}" ${filepath}/${filename}`)
                    break;

                case 'gif':
                    await execPromise(`ffmpeg -i ${filepath}/compress_${filename} -filter_complex "[0:v]scale=iw*${1 / (tries * 0.5 + 1)}:ih*${1 / (tries * 0.5 + 1)},split[pout][ppout];[ppout]palettegen=reserve_transparent=1[palette];[pout][palette]paletteuse=alpha_threshold=128[out]" -map "[out]" -gifflags -offsetting ${filepath}/compress2_${filename}`)
                    await execPromise(`gifsicle -O3 --lossy=${40 * tries} -o ${filepath}/${filename} ${filepath}/compress2_${filename}`)
                    if (fs.existsSync(`${filepath}/compress2_${filename}`)) fs.rmSync(`${filepath}/compress2_${filename}`)
                    break;

                case 'video':
                    await execPromise(`ffmpeg -i ${filepath}/compress_${filename} -vf "scale='ceil(iw*${1 / (tries * 0.5 + 1)}/2)*2':'ceil(ih*${1 / (tries * 0.5 + 1)}/2)*2'" ${tries > 1 ? `-crf ${Math.min(28 + 10 * tries, 51)} -b:v ${Math.round(128 / (tries * 0.5 + 1))}k -b:a ${Math.round(256 / (tries * 0.5 + 1))}k ` : ''}-preset veryslow ${filepath}/${filename}`)
                    break;

                case 'audio':
                    await execPromise(`ffmpeg -i ${filepath}/compress_${filename} -b:a ${Math.round(256 / (tries * 0.5 + 1))}k ${filepath}/${filename}`)
                    break;

                default:
                    fs.copyFileSync(`${filepath}/compress_${filename}`, `${filepath}/${filename}`)
                    tries = 5
                    break;
            }

            if (fs.existsSync(`${filepath}/compress_${filename}`)) {
                if (fs.existsSync(`${filepath}/${filename}`)) fs.rmSync(`${filepath}/compress_${filename}`)
                else {
                    fs.renameSync(`${filepath}/compress_${filename}`, `${filepath}/${filename}`)
                    break
                }
            }

            size = fs.readFileSync(`${filepath}/${filename}`).length
            tries++
        }

        try {
            fileBuffer = fs.readFileSync(`${filepath}/${filename}`)
        } catch (_) {
            await msg.reply('Couldn\'t send file.').catch(() => { })
            infoPost(`Couldn\'t send file`)
            await rateLimit(msg)

            if (extraOptions.keep ||
                filepath == undefined ||
                filepath.startsWith('tempfiles')) return

            fs.rm(filepath, { force: true, recursive: true })
            return
        }

        tooLarge = fileBuffer.length > getUploadLimit(msg)
    }

    var nameindex = args.indexOf('-filename')
    if (nameindex > -1 && args[nameindex + 1]) {
        extraOptions.name = args[nameindex + 1].replace(/[/\\?%*:|"<>]/g, '-').substring(0, 128)
    }

    if (extraOptions.catbox || (tooLarge && !extraOptions.nosend)) {
        if (tooLarge && !extraOptions.catbox && !extraOptions.nosend) await msg.reply(`${extraOptions.nocompress ? "Output file too" : "Still"} large${extraOptions.nocompress ? " to be sent to channel" : ""}, guess I\'m gonna try uploading it to a file hosting service.`).catch(() => { })
        infoPost(`Uploading to a file hosting service`)
        var fileLink = await HTTPClientUtils.uploadToFileHost(`${filepath}/${filename}`).catch(() => { })

        if (fileLink) {
            var isUrl = vars.validUrl.test(fileLink)

            if (extraOptions.nosend) {
                if (isUrl) {
                    addLastUrl(msg, fileLink)
                } else {
                    await msg.reply({
                        content: fileLink.includes('gif larger than 20 MB') ? 'ok so what happened right here is i tried to upload a gif with a size bigger than 20 mb to catbox.moe but apparently you cant do it so uhhhhhh haha no link for you' : fileLink,
                        allowedMentions: fetchPingPerms(msg)
                    }).catch(() => { })
                    infoPost(`Couldn\'t upload catbox.moe file, reason:\n\`${fileLink.includes('gif larger than 20 MB') ? 'ok so what happened right here is i tried to upload a gif with a size bigger than 20 mb to catbox.moe but apparently you cant do it so uhhhhhh haha no link for you' : fileLink}\``)
                }
            } else {
                await msg.reply({
                    content: fileLink.includes('gif larger than 20 MB') ? 'ok so what happened right here is i tried to upload a gif with a size bigger than 20 mb to catbox.moe but apparently you cant do it so uhhhhhh haha no link for you' : fileLink,
                    allowedMentions: fetchPingPerms(msg)
                }).catch(() => { })
                if (!isUrl) {
                    infoPost(`Couldn\'t upload catbox.moe file, reason:\n\`${fileLink.includes('gif larger than 20 MB') ? 'ok so what happened right here is i tried to upload a gif with a size bigger than 20 mb to catbox.moe but apparently you cant do it so uhhhhhh haha no link for you' : fileLink}\``)
                }
            }

            if (isUrl) returnUrl = fileLink
        } else {
            await msg.reply('Couldn\'t send file.').catch(() => { })
            infoPost(`Couldn\'t upload file`)
            await rateLimit(msg)
        }
    } else if (extraOptions.nosend) {
        infoPost(`Saving file temporarily`)

        var id = generateId(fs.readdirSync(`tempfiles/${config.database}`).map(file => {
            var name = file.split('.')
            if (name.length > 1) name = name.slice(0, name.length - 1)
            else name = name[0]
            return name
        }))

        var ext = filename.split('.')
        if (ext.length > 1) ext = `.${ext[ext.length - 1]}`
        else ext = ''

        fs.copyFileSync(`${filepath}/${filename}`, `tempfiles/${config.database}/${id}${ext}`)

        tempfiles[id] = {
            name: `${id}${ext}`,
            oname: filename,
            opath: filepath
        }

        addLastUrl(msg, `temp:${id}`)

        returnUrl = `temp:${id}`

        setTimeout(() => {
            fs.rmSync(`tempfiles/${config.database}/${id}${ext}`, { force: true, recursive: true })
            delete tempfiles[id]
        }, 600000)
    } else {
        infoPost(`Sending file to channel`)
        var sendObject = {
            files: [new Discord.AttachmentBuilder(`${filepath}/${filename}`, { name: extraOptions?.name ?? undefined })],
            allowedMentions: fetchPingPerms(msg)
        }

        if (extraOptions.content) sendObject.content = extraOptions.content

        var fileMsg = await msg.reply(sendObject).catch(() => { })

        if (!fileMsg) {
            await msg.reply('There was an error sending the file, so I\'m gonna try uploading it to a file hosting service.').catch(() => { })
            infoPost(`Failed to send file to channel, uploading to a file hosting service`)
            var fileLink = await HTTPClientUtils.uploadToFileHost(`${filepath}/${filename}`).catch(() => { })

            if (fileLink) {
                var isUrl = vars.validUrl.test(fileLink)
                await msg.reply({
                    content: fileLink.includes('gif larger than 20 MB') ? 'ok so what happened right here is i tried to upload a gif with a size bigger than 20 mb to catbox.moe but apparently you cant do it so uhhhhhh haha no link for you' : fileLink,
                    allowedMentions: fetchPingPerms(msg)
                }).catch(() => { })

                if (!isUrl) {
                    infoPost(`Couldn\'t upload file, reason:\n\`${fileLink.includes('gif larger than 20 MB') ? 'ok so what happened right here is i tried to upload a gif with a size bigger than 20 mb to catbox.moe but apparently you cant do it so uhhhhhh haha no link for you' : fileLink}\``)
                } else returnUrl = fileLink
            } else {
                await msg.reply('Couldn\'t send file.').catch(() => { })
                infoPost(`Couldn\'t upload file`)
                await rateLimit(msg)
            }
        } else returnUrl = fileMsg.attachments?.first?.()?.url ?? "oops i forgot"
    }

    if (extraOptions.keep ||
        filepath == undefined ||
        filepath.startsWith('tempfiles')) return returnUrl

    infoPost(`Deleting \`${filepath}/${filename}\` and its folder`)

    fs.rm(filepath, { force: true, recursive: true })
    return returnUrl
}

functions.getUploadLimit = function (msg) {
    if (msg.attachmentSizeLimit) return msg.attachmentSizeLimit

    switch (msg.guild.premiumTier) {
        case 3: return 1024 * 1024 * 100
        case 2: return 1024 * 1024 * 50
        default: return 1024 * 1024 * 10
    }
}

functions.cleanFileInfoUrl = function (url) {
    if (url.match(/https?:\/\/(?:media|cdn)\.discordapp\.(?:net|com)\/attachments/)) {
        url = url.replace(/\?(?:ex|is|hm)=.+$/, "")
    }

    return url
}

functions.validateFileFromPath = async function (path, exception, opts) {
    let poopy = this
    let config = poopy.config
    let vars = poopy.vars
    let tempdata = poopy.tempdata
    let { infoPost, execPromise } = poopy.functions
    let { fs, fileType } = poopy.modules

    return new Promise(async (resolve, reject) => {
        var rej = reject
        reject = function (val) {
            infoPost(`File can't be processed, reason:\n\`${val}\``)
            rej(val)
        }

        infoPost(`Validating file from path`)

        if ((process.memoryUsage().rss / 1024 / 1024) <= config.memLimit) {
            return reject('No resources available.')
        }

        if (!fs.existsSync(path)) {
            return reject('File not found.')
        }

        var revalidationTime = 60_000 * 10
        var validatedFile = tempdata.validatedFiles[path]

        if (validatedFile && (Date.now() - validatedFile.fetchedTime) < revalidationTime) {
            return resolve(validatedFile.fileInfo)
        }

        var type = await fileType.fromFile(path).catch(() => { })

        if (!type) {
            var body = fs.readFileSync(path).toString()
            type = { mime: body.match(/<[a-z][\s\S]*>([\s\S]*)<\/[a-z][\s\S]*>/g) ? 'text/html' : 'text/plain', ext: body.match(/<[a-z][\s\S]*>([\s\S]*)<\/[a-z][\s\S]*>/g) ? 'html' : 'plain' }
        }

        var info = {
            frames: 1,
            fps: '0/0',
            duration: 'N/A',
            aduration: 'N/A',
            width: 0,
            height: 0,
            audio: false,
            pixfmt: 'unk',
            size: 0,
            realsize: 0
        }
        var names = path.split('/')
        var limitObject = exception ? config.limitsexcept : config.limits
        var shorttype
        var shortext
        var shortpixfmt

        if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            shorttype = 'image'
            shortext = 'png'
            shortpixfmt = 'rgba'
        } else if (type.mime.startsWith('video')) {
            shorttype = 'video'
            shortext = 'mp4'
            shortpixfmt = 'yuv420p'
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            shorttype = 'gif'
            shortext = 'gif'
            shortpixfmt = 'bgra'
        } else if (type.mime.startsWith('audio')) {
            shorttype = 'audio'
            shortext = 'mp3'
            shortpixfmt = 'unk'
        } else {
            shorttype = type.mime.split('/')[0]
            shortext = type.ext
            shortpixfmt = 'unk'
        }

        var buffer = fs.readFileSync(path)

        info.size = buffer.length / 1048576
        info.realsize = buffer.length

        var json = await execPromise(`ffprobe -of json -show_streams -show_format "${path}"`)
        if (json) {
            try {
                var jsoninfo = JSON.parse(json)
                info.json = jsoninfo

                if (jsoninfo["streams"]) {
                    var videoStream = jsoninfo["streams"].find(stream => stream["codec_type"] === 'video')
                    var audioStream = jsoninfo["streams"].find(stream => stream["codec_type"] === 'audio')

                    if ((type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) || type.mime.startsWith('video') || type.mime.startsWith('audio')) {
                        info.duration = (videoStream || audioStream)["duration"] || jsoninfo["format"]?.["duration"] || 0
                    }
                    if ((type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) || type.mime.startsWith('video')) {
                        info.fps = videoStream["r_frame_rate"] || '0/0'
                        info.frames = videoStream["nb_frames"] || (info.duration != "N/A" && info.duration != "0" && info.fps != "0/0" && mathjs.evaluate(`${info.duration}/(1/${info.fps})`)) || 0
                    }
                    if (type.mime.startsWith('video') || type.mime.startsWith('audio')) {
                        info.audio = !!audioStream
                    }
                    if ((type.mime.startsWith('video') || type.mime.startsWith('audio')) && info.audio) {
                        info.aduration = audioStream["duration"] || 0
                    }
                    if (type.mime.startsWith('image') || type.mime.startsWith('video')) {
                        info.width = videoStream["width"] || 0
                        info.height = videoStream["height"] || 0
                        info.pixfmt = videoStream["pix_fmt"] || 'unk'
                    }
                }
            } catch (_) { }
        }

        if (exception !== 'very true') {
            for (var paramName in info) {
                if (limitObject[paramName]) {
                    var param = info[paramName]
                    var rejectMessage = opts?.rejectMessages ? opts.rejectMessages[paramName] : limitObject[paramName].message

                    if (param > limitObject[paramName][shorttype]) {
                        return reject(rejectMessage.replace('{param}', limitObject[paramName][shorttype]))
                    }
                }
            }
        }

        infoPost(`File \`${names[names.length - 1]}\` was successfully validated`)

        var fileInfo = {
            type: type,
            shorttype: shorttype,
            shortext: shortext,
            shortpixfmt: shortpixfmt,
            name: names[names.length - 1],
            info: info,
            path: path,
            buffer: buffer
        }

        tempdata.validatedFiles[path] = {
            fetchedTime: Date.now(),
            fileInfo
        }

        resolve(fileInfo)
    })
}

functions.validateFile = async function (url, exception, opts) {
    let poopy = this
    let config = poopy.config
    let vars = poopy.vars
    let tempfiles = poopy.tempfiles
    let tempdata = poopy.tempdata
    let { infoPost, execPromise, validateFileFromPath, generateId, cleanFileInfoUrl, correctUrl } = poopy.functions
    let { fileType, axios, fs } = poopy.modules

    return new Promise(async (resolve, reject) => {
        url = url || ' '
        var rej = reject
        reject = function (val) {
            infoPost(`File can't be processed, reason:\n\`${val}\``)
            rej(val)
        }

        infoPost(`Validating file from URL`)

        if ((process.memoryUsage().rss / 1024 / 1024) <= config.memLimit) {
            return reject('No resources available.')
        }

        if (url.startsWith('temp:')) {
            if (tempfiles[url.substring(5)]) await validateFileFromPath(`tempfiles/${config.database}/${tempfiles[url.substring(5)].name}`, exception, opts)
                .then(res => resolve(res))
                .catch(res => reject(res))
            else reject('Tempfile unavailable.')
            return
        }

        if (!vars.validUrl.test(url)) {
            if (opts?.noPathsAllowed) return reject('Invalid URL.')

            return await validateFileFromPath(url, exception, opts)
                .then(res => resolve(res))
                .catch(res => reject(res))
        }

        var revalidationTime = 60_000 * 10
        var fileInfoUrl = cleanFileInfoUrl(url)
        var validatedFile = tempdata.validatedFiles[fileInfoUrl]

        if (validatedFile && (Date.now() - validatedFile.fetchedTime) < revalidationTime) {
            return resolve(validatedFile.fileInfo)
        }

        url = await correctUrl(url, true)

        var response
        try {
            response = await axios({
                method: 'GET',
                url,
                responseType: 'stream',
                validateStatus: () => true
            })
        } catch (err) {
            return reject(err.message)
        }

        if (!response) return

        if (!(response.status >= 200 && response.status < 300)) {
            return reject(`${response.status} ${response.statusText}`)
        }

        var headers = response.headers

        var chunks = []

        for await (var chunk of response.data) {
            chunks.push(chunk)
        }

        var buffer = Buffer.concat(chunks)
        if (buffer.length >= 1024 * 1024 * 100) {
            return reject("File extremely giga mega large that exceeds the 100 MB limit.")
        }

        var type = await fileType.fromBuffer(buffer).catch(() => { })

        if (!type) {
            var contentType = headers['content-type'] || headers['Content-Type']
            var mime = contentType.match(/[^;]+/)
            type = {
                mime: mime[0],
                ext: mime[0].split('/')[1]
            }
        }

        var info = {
            frames: 1,
            fps: '0/0',
            duration: 'N/A',
            aduration: 'N/A',
            width: 0,
            height: 0,
            audio: false,
            pixfmt: 'unk',
            size: 0,
            realsize: 0
        }
        var limitObject = exception ? config.limitsexcept : config.limits
        var name
        var shorttype
        var shortext
        var shortpixfmt

        if (type.mime.startsWith('image') && !(vars.gifFormats.find(f => f === type.ext))) {
            shorttype = 'image'
            shortext = 'png'
            shortpixfmt = 'rgba'
        } else if (type.mime.startsWith('video')) {
            shorttype = 'video'
            shortext = 'mp4'
            shortpixfmt = 'yuv420p'
        } else if (type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) {
            shorttype = 'gif'
            shortext = 'gif'
            shortpixfmt = 'bgra'
        } else if (type.mime.startsWith('audio')) {
            shorttype = 'audio'
            shortext = 'mp3'
            shortpixfmt = 'unk'
        } else {
            shorttype = type.mime.split('/')[0]
            shortext = type.ext
            shortpixfmt = 'unk'
        }

        var parsedurl = new URL(url)
        name = parsedurl.pathname.split('/').pop()
        var contentdisposition = headers['content-disposition']
        if (contentdisposition) {
            var filenameMatch = contentdisposition.match(/filename=".+"/)
            if (filenameMatch) {
                name = filenameMatch[0].substring(10, filenameMatch[0].length - 1)
            }
        }

        var contentLength = headers['content-length'] || headers['Content-Length']

        if (contentLength) {
            info.size = Number(contentLength) / 1048576
            info.realsize = Number(contentLength)
        } else {
            info.size = buffer.length / 1048576
            info.realsize = buffer.length
        }

        var tempFilePath = `tempfiles/${config.database}/${generateId()}.${type.ext}`
        fs.writeFileSync(tempFilePath, buffer)
        setTimeout(() => fs.rmSync(tempFilePath), revalidationTime)

        var json = await execPromise(`ffprobe -of json -show_streams -show_format ${tempFilePath}`).catch(() => { })
        if (json) {
            try {
                var jsoninfo = JSON.parse(json)
                info.json = jsoninfo

                if (jsoninfo["streams"]) {
                    var videoStream = jsoninfo["streams"].find(stream => stream["codec_type"] === 'video')
                    var audioStream = jsoninfo["streams"].find(stream => stream["codec_type"] === 'audio')

                    if ((type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) || type.mime.startsWith('video') || type.mime.startsWith('audio')) {
                        info.duration = (videoStream || audioStream)["duration"] || jsoninfo["format"]?.["duration"] || 0
                    }
                    if ((type.mime.startsWith('image') && vars.gifFormats.find(f => f === type.ext)) || type.mime.startsWith('video')) {
                        info.fps = videoStream["r_frame_rate"] || '0/0'
                        info.frames = videoStream["nb_frames"] || (info.duration != "N/A" && info.duration != "0" && info.fps != "0/0" && mathjs.evaluate(`${info.duration}/(1/${info.fps})`)) || 0
                    }
                    if (type.mime.startsWith('video') || type.mime.startsWith('audio')) {
                        info.audio = !!audioStream
                    }
                    if ((type.mime.startsWith('video') || type.mime.startsWith('audio')) && info.audio) {
                        info.aduration = audioStream["duration"] || 0
                    }
                    if (type.mime.startsWith('image') || type.mime.startsWith('video')) {
                        info.width = videoStream["width"] || 0
                        info.height = videoStream["height"] || 0
                        info.pixfmt = videoStream["pix_fmt"] || 'unk'
                    }
                }
            } catch (_) { }
        }

        if (exception !== 'very true') {
            for (var paramName in info) {
                if (limitObject[paramName]) {
                    var param = info[paramName]
                    var rejectMessage = opts?.rejectMessages ? opts?.rejectMessages[paramName] : limitObject[paramName].message

                    if (param > limitObject[paramName][shorttype]) {
                        return reject(rejectMessage.replace('{param}', limitObject[paramName][shorttype]))
                    }
                }
            }
        }

        infoPost(`File \`${name}\` was successfully validated`)

        var fileInfo = {
            type: type,
            shorttype: shorttype,
            shortext: shortext,
            shortpixfmt: shortpixfmt,
            name: name,
            info: info,
            path: tempFilePath,
            buffer: buffer
        }

        tempdata.validatedFiles[fileInfoUrl] = {
            fetchedTime: Date.now(),
            fileInfo
        }

        resolve(fileInfo)
    })
}

functions.changeStatus = function () {
    let poopy = this
    let bot = poopy.bot
    let vars = poopy.vars
    let config = poopy.config
    let json = poopy.json
    let globaldata = poopy.globaldata
    let { infoPost, rotAway } = poopy.functions

    if (!config.allowpresence) return

    if (bot && vars.statusChanges) {
        var choosenStatus = json.statusJSON[Math.floor(Math.random() * json.statusJSON.length)]
        infoPost(`Status changed to ${choosenStatus.type.toLowerCase()} ${((choosenStatus.type === "Competing" && 'in ') || (choosenStatus.type === "Listening" && 'to ') || '')}${choosenStatus.name}`)
        bot.user.setPresence({
            status: 'online',
            activities: [
                {
                    name: rotAway(
                        choosenStatus.name + ` | ${config.globalPrefix}help`,
                        globaldata.rotAway,
                        { begForHelp: true }
                    ),
                    type: DiscordTypes.ActivityType[choosenStatus.type],
                    url: choosenStatus.url ?? 'https://www.youtube.com/watch?v=MURAALuH_TE'
                }
            ],
        })
    }
}

var saveQueued = []
var saveQueueRunning = false

functions.saveQueue = async function () {
    let poopy = this

    saveQueued.push(poopy)

    if (saveQueueRunning) return
    saveQueueRunning = true

    while (saveQueued.length) {
        for (var i = 0; i < saveQueued.length; i++) {
            let pooper = saveQueued[i]
            if (!pooper || !pooper.data || !pooper.globaldata) continue
            await pooper.functions.saveData()
            await functions.sleep(120000)
        }
    }
}

functions.requestData = async function () {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let globaldata = poopy.globaldata
    let { fs } = poopy.modules

    var data = {
        data: {},
        globaldata: {}
    }

    if (config.testing || !process.env.MONGODB_URL) {
        console.log(`${bot.user.displayName}: gathering from json`)
        if (fs.existsSync(`data/${config.database}.json`)) {
            try {
                data.data = fs.readJSONSync(`data/${config.database}.json`)
            } catch (_) {
                try {
                    console.log(`${bot.user.displayName}: ERROR LOADING DATA. using backup...`)
                    data.data = fs.readJSONSync(`data/${config.database}_bak.json`)
                } catch (_) {
                    console.log(`${bot.user.displayName}: GENERAL ERROR LOADING DATA. using fallback and disabling saving...`)

                    config.notSave = true
                    config.dataLoadError = true
                    data.data = {
                        botData: {},
                        userData: {},
                        guildData: {}
                    }
                }
            }
        } else if (fs.existsSync(`data/${config.database}_bak.json`)) {
            try {
                data.data = fs.readJSONSync(`data/${config.database}_bak.json`)
            } catch (_) {
                console.log(`${bot.user.displayName}: GENERAL ERROR LOADING DATA. using fallback and disabling saving...`)

                config.notSave = true
                config.dataLoadError = true
                data.data = {
                    botData: {},
                    userData: {},
                    guildData: {}
                }
            }
        } else {
            console.log(`${bot.user.displayName}: creating new data`)
            data.data = {
                botData: {},
                userData: {},
                guildData: {}
            }
        }

        if (Object.keys(globaldata).length <= 0) {
            if (fs.existsSync(`data/globaldata.json`)) {
                try {
                    data.globaldata = fs.readJSONSync(`data/globaldata.json`)
                } catch (_) {
                    try {
                        console.log(`${bot.user.displayName}: ERROR LOADING GLOBAL DATA. using backup...`)
                        data.data = fs.readJSONSync(`data/globaldata_bak.json`)
                    } catch (_) {
                        console.log(`${bot.user.displayName}: GENERAL ERROR LOADING GLOBAL DATA. using fallback and disabling saving...`)

                        config.notSave = true
                        config.dataLoadError = true
                        data.globaldata = {}
                    }
                }
            } else if (fs.existsSync(`data/globaldata_bak.json`)) {
                try {
                    data.globaldata = fs.readJSONSync(`data/globaldata_bak.json`)
                } catch (_) {
                    console.log(`${bot.user.displayName}: GENERAL ERROR LOADING GLOBAL DATA. using fallback and disabling saving...`)

                    config.notSave = true
                    config.dataLoadError = true
                    data.globaldata = {}
                }
            } else {
                console.log(`${bot.user.displayName}: creating global data`)
                data.globaldata = {}
            }
        }
    } else {
        console.log(`${bot.user.displayName}: gathering from mongodb`)
        data.data.botData = await dataGather.botData(config.database)
        if (Object.keys(globaldata).length <= 0) {
            data.globaldata = await dataGather.globalData()
        }
    }

    return data
}

functions.saveData = async function () {
    let poopy = this
    let config = poopy.config
    let data = poopy.data
    let globaldata = poopy.globaldata
    let { infoPost, dataGather } = poopy.functions
    let { fs } = poopy.modules

    if (!fs.existsSync('data')) fs.mkdirSync('data')

    if (config.notSave || Object.keys(data).length <= 0 || Object.keys(globaldata).length <= 0) return

    infoPost(`Saving data`)

    const filesToSave = [
        {
            path: `data/${config.database}.json`,
            backupPath: `data/${config.database}_bak.json`,
            data: data
        },
        {
            path: `data/globaldata.json`,
            backupPath: `data/globaldata_bak.json`,
            data: globaldata
        }
    ]

    async function saveFileData(fileData) {
        let dataStats = fs.existsSync(fileData.path)
            && fs.statSync(fileData.path)

        if (!dataStats) {
            fs.writeJSONSync(fileData.path, fileData.data)
            dataStats = fs.existsSync(fileData.path)
                && fs.statSync(fileData.path)
        }

        let backupStats = fs.existsSync(fileData.backupPath)
            && fs.statSync(fileData.backupPath)

        const isBackupLarger = dataStats && backupStats && dataStats.size < backupStats.size

        if (!isBackupLarger) {
            fs.rmSync(fileData.backupPath, { force: true })
        }

        if (!isBackupLarger || !backupStats) {
            fs.renameSync(fileData.path, fileData.backupPath)
        }

        fs.writeJSONSync(fileData.path, fileData.data)
    }

    if ((config.testing || !process.env.MONGODB_URL) && !config.notSave) {
        await Promise.all(filesToSave.map(saveFileData))
    } else {
        const dataObject = { data, globaldata }
        await dataGather.update(config.database, dataObject).catch(() => { })
    }

    infoPost(`Data saved`)
}

functions.updateSlashCommands = async function () {
    let poopy = this
    let config = poopy.config
    let bot = poopy.bot
    let rest = poopy.rest
    let arrays = poopy.arrays
    let { Discord } = poopy.modules

    if (config.self) return

    var slashBuilders = Object.values(arrays.slashBuilders)

    var existingCommands = await rest.get(Discord.Routes.applicationCommands(bot.user.id))

    var entryPoint = existingCommands.find(cmd => cmd.type == 4 && cmd.name == "launch")

    if (entryPoint) slashBuilders.push(entryPoint)

    await rest.put(
        Discord.Routes.applicationCommands(bot.user.id),
        { body: slashBuilders }
    ).catch((e) => console.log(e))
}

functions.findCommand = function (name) {
    let poopy = this
    let commands = poopy.commands

    return commands.find(c => c.name.find(n => n === name) != undefined)
}

functions.waitMessageCooldown = async function () {
    let poopy = this
    let config = poopy.config
    let vars = poopy.vars
    let functions = poopy.functions

    if (config.msgcooldown <= 0) return

    const positionInQueue = ++vars.msgcount

    try {
        const delay = config.msgcooldown * (positionInQueue - 1)

        if (delay > 0) {
            await functions.sleep(delay)
        }

        const elapsed = Date.now() - vars.msgcooldown
        if (elapsed < config.msgcooldown) {
            await functions.sleep(config.msgcooldown - elapsed)
        }
    } finally {
        vars.msgcount--
    }
}

functions.setMessageCooldown = async function (msg) {
    let poopy = this
    let vars = poopy.vars

    vars.msgcooldown = Date.now()

    return msg
}

functions.calculateHivemindStatus = async function (poopy) {
    let bot = poopy.bot

    if (!process.env.HIVEMIND_ID || !poopy.config.hivemind) return '';

    var cusage = process.cpuUsage()
    var cused = (cusage.user + cusage.system) / 1024 / 1024

    return `${bot.user.displayName} #${process.env.HIVEMIND_ID} is here.\n\nCPU: ${cused}`
}

functions.updateHivemindStatus = async function () {
    let poopy = this
    let bot = poopy.bot
    let vars = poopy.vars

    if (!process.env.HIVEMIND_ID || !poopy.config.hivemind) return;

    var hivemindGuildId = process.env.HIVEMIND_GUILD_ID ?? '834431435704107018'
    var hivemindChannelId = process.env.HIVEMIND_CHANNEL_ID ?? '1201074511118868520'
    var hivemindChannel = bot.guilds.cache.get(hivemindGuildId).channels.cache.get(hivemindChannelId)

    if (!vars.hivemindMessageId) {
        functions.calculateHivemindStatus(poopy).then(status => {
            hivemindChannel.send(status).then(message => {
                vars.hivemindMessageId = message.id
            }).catch((err) => { console.log(err) });
        }).catch((err) => { console.log(err) });

        return;
    }

    functions.calculateHivemindStatus(poopy).then(status => {
        hivemindChannel.messages.cache.get(vars.hivemindMessageId).edit(status).catch((err) => { console.log(err) })
    }).catch((err) => { console.log(err) });

    return;
}

functions.getTotalHivemindStatus = async function () {
    let poopy = this
    let bot = poopy.bot

    if (!process.env.HIVEMIND_ID || !poopy.config.hivemind) return;

    var hivemindGuildId = process.env.HIVEMIND_GUILD_ID ?? '834431435704107018'
    var hivemindChannelId = process.env.HIVEMIND_CHANNEL_ID ?? '1201074511118868520'
    var hivemindChannel = bot.guilds.cache.get(hivemindGuildId).channels.cache.get(hivemindChannelId)

    var status = [];

    var messages = hivemindChannel.messages.fetch()
    if (messages.catch) messages = await messages.catch((err) => { console.log(err) })

    messages.forEach(async (msg) => {
        var regexResult = /(?<botName>[^#]+) #(?<id>[^ ]+)/g.exec(msg.content)
        if (!regexResult) {
            await msg.delete().then(msg => console.log(`Deleted non-hivemind message from ${msg.author.displayName} as ${bot.user.displayName} #${process.env.HIVEMIND_ID}.`)).catch((err) => { console.log(err) });
            return;
        }
        var { botName, id } = regexResult.groups
        if (botName !== bot.user.displayName) return;

        var timestamp = msg.editedTimestamp || msg.createdTimestamp

        if ((Date.now() - timestamp) > 60000 + 30000) {
            if (id == process.env.HIVEMIND_ID) {
                await msg.delete().then(msg => console.log(`Deleted outdated message from ${msg.author.displayName} as ${bot.user.displayName} #${process.env.HIVEMIND_ID}.\nTimestamp is: ${timestamp} (${(new Date(timestamp)).toLocaleString('en-gb')})`)).catch((err) => { console.log(err) });
            }

            return
        }

        var EpicFail = false

        status.forEach((item, i) => {
            if (item.id == id) {
                if (item.time > msg.createdTimestamp) {
                    EpicFail = true
                    return
                } else {
                    status.splice(i, 1)
                }
            }
        })

        if (EpicFail) return;

        var regexResult = /CPU: (?<cpu>[0-9\.]+)/g.exec(msg.content)
        if (!regexResult) return;
        var { cpu } = regexResult.groups
        cpu = Number(cpu)

        status.push({ botName: botName, id: id, cpu: cpu, time: msg.createdTimestamp });
    })

    if (status.length > 0) {
        status.sort((a, b) => a.cpu - b.cpu)
    }

    return status;
}

functions.getShieldById = function (shieldId) {
    let poopy = this
    let json = poopy.json

    var shields = json.shieldJSON

    if (shieldId === undefined)
        return undefined

    return shields.find((shield) => shield.id == shieldId)
}

functions.formatNumberWithPreset = function (number, preset) {
    var displaySign = preset.startsWith('+')
    var displaySignFlipped = preset.startsWith('-')
    displaySign = displaySign || displaySignFlipped

    if (displaySign)
        preset = preset.substring(1)

    var formattedString = ""

    switch (preset) {
        case "%":
            formattedString = `${number * 100}%`
            break

        case "=":
            formattedString = String(number)
            break
    }

    if (displaySign) {
        var sign = Math.sign(number)
        var signSymbol = sign >= 0 ? '+' : '-'
        if (displaySignFlipped)
            signSymbol = signSymbol == '+' ? '-' : '+'

        formattedString = signSymbol + formattedString
    }

    return formattedString
}

functions.getShieldStatsAsEmbedFields = function (shield) {
    let poopy = this
    let vars = poopy.vars
    let { formatNumberWithPreset } = poopy.functions

    var shieldStats = []

    for (var i in vars.shieldStatsDisplayInfo) {
        var statDisplayInfo = vars.shieldStatsDisplayInfo[i]
        var statName = statDisplayInfo.name

        var statValue = shield.stats[statName]
        if (statValue === undefined)
            continue

        shieldStats.push({
            name: statDisplayInfo.displayName,
            value: formatNumberWithPreset(statValue, statDisplayInfo.format),
            inline: true
        })
    }

    return shieldStats
}

functions.queryPage = function (channel, who, page, lastPage, interaction) {
    let poopy = this
    let bot = poopy.bot
    let config = poopy.config
    let { dmSupport, parseNumber, createCollector } = poopy.functions
    let { Discord } = poopy.modules

    var newpage = page

    return new Promise(async resolve => {
        if (config.useReactions) {
            var goMessage = await channel.send('Which page would you like to go...?').catch(() => { })

            var pageCollector = createCollector({
                id: `${channel.id}_${who}`,
                type: "message", time: 30000
            })

            pageCollector.on('collect', (msg) => {
                dmSupport(msg)

                if (!(msg.author.id === who && ((msg.author.id !== bot.user.id && !msg.author.bot) || config.allowbotusage))) {
                    return
                }

                newpage = parseNumber(msg.content, { dft: page, min: 1, max: lastPage, round: true })
                pageCollector.stop()
                msg.delete().catch(() => { })
            })

            pageCollector.on('end', () => {
                if (goMessage) goMessage.delete().catch(() => { })
                resolve(newpage)
            })
        } else {
            var pageModal = new Discord.ModalBuilder()
                .setCustomId('page-modal')
                .setTitle('Select your page...')
                .addComponents(
                    new Discord.ActionRowBuilder().addComponents(
                        new Discord.TextInputBuilder()
                            .setCustomId('page-num')
                            .setLabel('Page')
                            .setStyle(Discord.TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(String(lastPage).length)
                            .setPlaceholder(`1-${lastPage}`)
                            .setRequired(true)
                    )
                )

            interaction.showModal(pageModal).then(() => {
                var done = false

                var modalCallback = (modal) => {
                    if (modal.type !== DiscordTypes.InteractionType.ModalSubmit) return

                    if (modal.deferUpdate) modal.deferUpdate().catch(() => { })

                    if (!(modal.user.id === who && ((modal.user.id !== bot.user.id && !modal.user.bot) || config.allowbotusage)) || done) {
                        return
                    }

                    done = true
                    newpage = parseNumber(modal.fields.getTextInputValue('page-num'), { dft: page, min: 1, max: lastPage, round: true })
                    clearTimeout(modalTimeout)
                    resolve(newpage)
                }

                var modalTimeout = setTimeout(() => {
                    if (!done) {
                        done = true
                        bot.removeListener('interactionCreate', modalCallback)
                        resolve(newpage)
                    }
                }, 30000)

                bot.once('interactionCreate', modalCallback)
            }).catch(() => resolve(newpage))
        }
    })
}

functions.resolveUser = async function (identifier, guild, mode = "memberOrUser") {
    let poopy = this
    let bot = poopy.bot
    let data = poopy.data
    let { similarity } = poopy.functions

    if (!identifier) return undefined

    identifier = String(identifier).trim()
    let strippedMentionIdentifier = identifier.replace(/^<@/, '').replace(/>$/, '')
    let identifierIsId = strippedMentionIdentifier.match(/^\d+$/)?.[0] === strippedMentionIdentifier

    function formatResult(memberOrUser) {
        if (!memberOrUser) return undefined
        if (mode === "user") return memberOrUser.user ?? memberOrUser
        if (mode === "member") return memberOrUser.user ? memberOrUser : undefined
        if (mode === "memberOrUser") return memberOrUser.user ? memberOrUser : memberOrUser
    }

    if (identifierIsId) {
        let resolved =
            (guild && await guild.members.fetch(strippedMentionIdentifier).catch(() => { })) ||
            (await bot.users.fetch(strippedMentionIdentifier).catch(() => { }))
        return formatResult(resolved)
    }

    let identifierLower = identifier.toLowerCase()

    let cached =
        (guild && guild.members?.cache.find(
            m => m.displayName?.toLowerCase() === identifierLower ||
                m.user?.displayName?.toLowerCase() === identifierLower ||
                m.user?.tag?.toLowerCase() === identifierLower
        )) ||
        bot.users.cache.find(
            u => u.id && (u.displayName?.toLowerCase() === identifierLower ||
                u.tag?.toLowerCase() === identifierLower)
        )
    if (cached) return formatResult(cached)

    let leaderboardEntry = Object.entries(data.botData.leaderboard)
        .find(([_, user]) => user.tag && user.tag.toLowerCase() === identifierLower)
    if (leaderboardEntry) {
        let resolved =
            (guild && await guild.members.fetch(leaderboardEntry[0]).catch(() => { })) ||
            (await bot.users.fetch(leaderboardEntry[0]).catch(() => { }))
        if (resolved) return formatResult(resolved)
    }

    if (guild) {
        let member =
            guild.members?.cache.find(
                m => m.displayName?.toLowerCase() === identifierLower ||
                    m.user?.displayName?.toLowerCase() === identifierLower ||
                    m.user?.tag?.toLowerCase() === identifierLower
            ) ||
            await (async () => {
                let searchResults = await guild.members.search({ query: identifier })
                let highestSimilarity = searchResults.mapValues(m =>
                    Math.max(
                        similarity(m.user.username, identifier),
                        m.displayName ? similarity(m.displayName, identifier) : 0,
                        m.user?.displayName ? similarity(m.user.displayName, identifier) : 0,
                        m.user?.tag ? similarity(m.user.tag, identifier) : 0
                    )
                )
                let thresholded = highestSimilarity
                    .filter(score => score > 0.7)
                    .sorted((a, b) => b - a)
                return searchResults.get(thresholded.firstKey())
            })()
        if (member) return formatResult(member)
    }

    return undefined
}

functions.quotationMarksInput = function (text) {
    let poopy = this
    let vars = poopy.vars

    var symbolReplacedText
    vars.symbolreplacements.forEach(symbolReplacement => {
        symbolReplacement.target.forEach(target => {
            symbolReplacedText = symbolReplacedText.replace(new RegExp(target, 'ig'), symbolReplacement.replacement)
        })
    })

    var match = symbolReplacedText.match(/(?<!\\)"(.*?)(?<!\\)"/s)
    if (!match) {
        match = []
    }

    for (let i = 0; i < match.length; i++) {
        match[i] = match[i].replace(/\\(?=")/g, "")
    }

    var matchedStrings = Array.from(match).splice(1)

    return matchedStrings, match
}

functions.fetchPronounFields = async function (user, guild) {
    let poopy = this
    let { axios } = poopy.modules

    if (!process.env.DISCORD_REFRESHER_TOKEN)
        return null

    var response = await axios({
        method: 'GET',
        url: `https://discord.com/api/v9/users/${user.id}/profile` + (guild ? `?guild_id=${guild.id}` : ''),
        headers: {
            "Authorization": process.env.DISCORD_REFRESHER_TOKEN,
            "Accept": "application/json"
        }
    }).catch(() => { })

    if (!response)
        // No response?
        return

    if (response.status < 200 || response.status >= 300)
        // Request failed
        return

    var serverPronouns = ''
    var userPronouns = ''

    if (response.data.guild_member_profile && response.data.guild_member_profile.pronouns !== undefined)
        serverPronouns = response.data.guild_member_profile.pronouns

    if (response.data.user_profile && response.data.user_profile.pronouns !== undefined)
        userPronouns = response.data.user_profile.pronouns

    return [userPronouns, serverPronouns]
}

functions.pronouns = async function (user, guild) {
    // Return an array of possible pronouns. ['they', 'he', 'she', 'it'] in order of appearance
    // Returns all by default
    let poopy = this
    let tempdata = poopy.tempdata
    let { fetchPronounFields } = poopy.functions

    var userTempdata = tempdata[user.id] ?? (tempdata[user.id] = {
        pronouns: [],
        pronounsExpireDate: 0
    })

    var userCachedPronouns = userTempdata.pronouns
    if (userCachedPronouns && userCachedPronouns.length > 0 && userTempdata.pronounsExpireDate > Date.now())
        return userCachedPronouns

    var defaultPronouns = ['they', 'he', 'she', 'it']

    var guildMember = guild && await guild.members.fetch(user.id).catch(() => { })

    var pronounFields = await fetchPronounFields(user, guildMember && guild).catch((e) => console.log(e))
    if (!pronounFields)
        return defaultPronouns

    var [userProfilePronouns, serverProfilePronouns] = pronounFields

    function findPronouns(pronounsString) {
        var pileOfPronouns = new Set()

        var pronounElements = pronounsString.split('/')
        for (var pronoun of pronounElements) {
            pronoun = pronoun.trim().toLowerCase().replace(/[^ \/a-zA-Z0-9]/, '')

            switch (pronoun) {
                case 'he':
                case 'him':
                case 'his':
                case 'himself':
                    pileOfPronouns.add('he')
                    break

                case 'she':
                case 'her':
                case 'hers':
                case 'herself':
                    pileOfPronouns.add('she')
                    break

                case 'they':
                case 'them':
                case 'theirs':
                case 'themselves':
                case 'themself':
                    pileOfPronouns.add('they')
                    break

                case 'it':
                case 'its':
                case 'itself':
                    pileOfPronouns.add('it')
                    break

                case 'any':
                case 'all':
                case 'anything':
                case 'whatever':
                    pileOfPronouns.add('they')
                    pileOfPronouns.add('he')
                    pileOfPronouns.add('she')
                    pileOfPronouns.add('it')
                    break
            }
        }

        return pileOfPronouns
    }

    var pilesOfPronouns = [findPronouns(serverProfilePronouns), findPronouns(userProfilePronouns)]
    pilesOfPronouns = pilesOfPronouns.filter(
        pileOfPronouns => pileOfPronouns.size > 0
    )

    if (pilesOfPronouns.length == 0)
        return defaultPronouns

    var chosenPronouns = Array.from(pilesOfPronouns[0])

    userTempdata.pronouns = chosenPronouns
    userTempdata.pronounsExpireDate = Date.now() + (10_000 * 60)

    return chosenPronouns
}

module.exports = functions
