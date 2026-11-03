const cuimp = require("cuimp")
const axios = require("axios")
const cheerio = require("cheerio")
const FormData = require("form-data")

const fs = require("fs-extra")
const path = require("path")
const queryString = require("querystring")
const flatten = require("lodash.flatten")

const { Catbox, Litterbox } = require("catbox.moe")
const { validUrl } = require("./vars")

const catbox = new Catbox()
const litterbox = new Litterbox()

const clientHeaders = {
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
}

const providers = [
    "searxng",
    "duckduckgo",
    "startpage",
    "google",
    "unsplash"
]

if (!fs.existsSync("data")) fs.mkdirSync("data")
if (!fs.existsSync("data/imagesearchdata.json")) {
    fs.writeJSONSync("data/imagesearchdata.json", Object.fromEntries(providers.map(
        (provider) => [provider, {}]
    )))
}

const clientImgResults = fs.readJSONSync("data/imagesearchdata.json")

const clientImgQueries = Object.fromEntries(providers.map(
    (provider) => [provider, {
        cooldown: false,
        active: false,
        jobs: []
    }]
))

const cuimpClient = cuimp.createCuimpHttp({
    cookieJar: true
})

const axiosClient = axios.create({
    withCredentials: true,
    headers: clientHeaders
})

let providerSearchOrder = ["searxng"]

async function processQueue(queue, interval = 5000) {
    if (queue.active || queue.jobs.length === 0) return
    queue.active = true

    const job = queue.jobs.shift()
    await job()

    setTimeout(() => {
        queue.active = false
        processQueue(queue, interval)
    }, interval + Math.floor(Math.random() * 800))
}

function enqueue(queue, fn, interval = 15000) {
    return new Promise(resolve => {
        queue.jobs.push(async () => resolve(await fn()))
        processQueue(queue, interval)
    })
}

async function ddgs(
    query,
    {
        region = "us-en",
        safesearch = "moderate",
        page = 1,

        timelimit,
        size,
        color,
        type,
        layout,
        license,
    } = {}
) {
    function extractVQD(html) {
        const patterns = [
            /vqd="([^"]+)"/,
            /vqd=([^&]+)/,
            /vqd='([^']+)'/,
        ]

        for (const pattern of patterns) {
            const match = html.match(pattern)
            if (match) return match[1]
        }

        throw new Error("Failed to extract vqd")
    }

    async function getVQD(query) {
        const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`

        const res = await cuimpClient.request({
            url: url,
            baseURL: "https://duckduckgo.com/",
            method: "GET",
            headers: clientHeaders
        })

        return extractVQD(res.data.toString())
    }

    function buildFilters({
        timelimit,
        size,
        color,
        type,
        layout,
        license,
    } = {}) {
        const filters = []

        if (timelimit) {
            const map = {
                d: "Day",
                w: "Week",
                m: "Month",
                y: "Year",
            }

            filters.push(`time:${map[timelimit]}`)
        }

        if (size) filters.push(`size:${size}`)
        if (color) filters.push(`color:${color}`)
        if (type) filters.push(`type:${type}`)
        if (layout) filters.push(`layout:${layout}`)
        if (license) filters.push(`license:${license}`)

        return filters.join(",")
    }

    const vqd = await getVQD(query)

    const safeMap = {
        on: "1",
        moderate: "1",
        off: "-1",
    }

    const params = new URLSearchParams({
        o: "json",
        q: query,
        l: region,
        vqd,
        p: safeMap[safesearch],
        ct: "AT",
    })

    const f = buildFilters({
        timelimit,
        size,
        color,
        type,
        layout,
        license,
    })

    if (f) {
        params.set("f", f)
    }

    if (page > 1) {
        params.set("s", String((page - 1) * 100))
    }

    const res = await cuimpClient.request({
        url: `https://duckduckgo.com/i.js?${params}`,
        baseURL: "https://duckduckgo.com/",
        method: "GET",
        headers: {
            ...clientHeaders,
            "Referer": "https://duckduckgo.com/",
            "Sec-GPC": "1",
            "Priority": "u=4"
        }
    })

    if (res.status !== 200) {
        throw new Error(`HTTP ${res.status}`)
    }

    const data = JSON.parse(res.data.toString())

    return data.results.map((item) => ({
        title: item.title,
        image: item.image,
        thumbnail: item.thumbnail,
        url: item.url,
        width: item.width,
        height: item.height,
        source: item.source,
    }))
}

async function gis(opts) {
    const baseURL = "http://images.google.com/search?"

    function addSiteExcludePrefix(s) {
        return "-site:" + s
    }

    function containsAnyImageFileExtension(s) {
        const lowercase = s.toLowerCase()
        const imageFileExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp" /*, ".svg"*/]

        return imageFileExtensions.some(containsImageFileExtension)

        function containsImageFileExtension(ext) {
            return lowercase.includes(ext)
        }
    }

    let searchTerm
    let queryStringAddition
    let filterOutDomains = ["gstatic.com"]

    if (typeof opts === "string") {
        searchTerm = opts
    } else {
        searchTerm = opts.searchTerm
        queryStringAddition = opts.queryStringAddition
        if (opts.filterOutDomains) {
            filterOutDomains = filterOutDomains.concat(opts.filterOutDomains)
        }
        if (opts.userAgent) {
            userAgent = opts.userAgent
        }
    }

    let url =
        baseURL +
        queryString.stringify({
            tbm: "isch",
            q: searchTerm
        })

    if (filterOutDomains) {
        url += encodeURIComponent(
            " " + filterOutDomains.map(addSiteExcludePrefix).join(" ")
        )
    }

    if (queryStringAddition) {
        url += queryStringAddition
    }

    const response = await cuimpClient.get(url)
    const body = response.data

    const $ = cheerio.load(body)
    const scripts = $("script")
    const scriptContents = []
    for (let i = 0; i < scripts.length; ++i) {
        if (scripts[i].children.length > 0) {
            const content = scripts[i].children[0].data
            if (containsAnyImageFileExtension(content)) {
                scriptContents.push(content)
            }
        }
    }

    function collectImageRefs(content) {
        const refs = []
        const re = /\["(http.+?)",(\d+),(\d+)\]/g
        let result
        while ((result = re.exec(content)) !== null) {
            if (result.length > 3) {
                const ref = {
                    url: result[1],
                    width: +result[3],
                    height: +result[2]
                }
                if (domainIsOK(ref.url))
                    refs.push(ref)
            }
        }
        return refs
    }

    function domainIsOK(url) {
        if (!filterOutDomains)
            return true
        else
            return filterOutDomains.every(skipDomainIsNotInURL)

        function skipDomainIsNotInURL(skipDomain) {
            return url.indexOf(skipDomain) === -1
        }
    }

    return flatten(scriptContents.map(collectImageRefs))
}

async function fetchImages(query, {
    unsafe = false,
    searchProvider
}) {
    query = query.toLowerCase().trim().replace(/\s+/g, " ")
    unsafe = false // your choices dont matter

    const failImageResults = [
        {
            title: "Poopy Image Search Has Failed",
            image: "https://i.imgur.com/K5kyI8P.png",
            url: process.env.BOT_WEBSITE ?? "https://i.imgur.com/K5kyI8P.png"
        }
    ]

    const urlBlacklist = [
        "https://www.tiktok.com/api",
        "https://lookaside.instagram.com/seo",
        "https://lookaside.fbsbx.com/lookaside/crawler/instagram",
        "https://lookaside.fbsbx.com/lookaside/crawler/threads",
        ".svg"
    ]

    const filterResults = (result, i, self) => !urlBlacklist.some(url => result.image.includes(url))
        && self.findIndex(r => result.image == r.image) == i

    async function performProviderSearch(provider) {
        switch (provider) {
            case "searxng": {
                const searchUrl = `https://searx.projectlounge.pw/search?format=json&safesearch=2&language=en`
                    + `&engines=privacywall+images%2Cgoogle+cse+images&q=${encodeURIComponent(query)}`

                return enqueue(clientImgQueries[provider], () =>
                    axiosClient.get(searchUrl).then((res) => {
                        const images = res.data.results
                            .map(result => {
                                const image = result.img_src
                                const source = result.url

                                if ([image, source].some(s => {
                                    if (typeof s != "string") return true
                                    try {
                                        if (new URL(image).protocol != "https:") return true
                                    } catch { return true }
                                    return false
                                })) return

                                return {
                                    title: result.title || "SearXNG Image Result",
                                    image,
                                    url: source
                                }
                            })
                            .filter(Boolean)
                            .filter(filterResults)

                        return images
                    }).catch(() => {
                        clientImgQueries[provider].cooldown = true
                        setTimeout(() => clientImgQueries[provider].cooldown = false, 30_000)
                        return failImageResults
                    }))
            }

            case "duckduckgo": {
                return enqueue(clientImgQueries[provider], () =>
                    ddgs(query, { safesearch: unsafe ? "off" : "on" }).then(results => {
                        const images = results
                            .map((r) => ({ title: r.title, image: r.image, url: r.url }))
                            .filter(filterResults)

                        return images
                    }).catch(() => {
                        clientImgQueries[provider].cooldown = true
                        setTimeout(() => clientImgQueries[provider].cooldown = false, 60_000 * 5)
                        return failImageResults
                    }))
            }

            case "unsplash": {
                return cuimpClient.get("https://api.unsplash.com/search/photos", {
                    params: {
                        query,
                        per_page: 100
                    },
                    headers: {
                        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                    }
                }).then(res => {
                    const images = res.data.results.map(img => {
                        const url = img.urls.regular

                        return {
                            title: "Unsplash Image Result",
                            image: url, url
                        }
                    })

                    return images
                })
            }

            case "startpage": {
                const searchUrl = `https://www.startpage.com/sp/search?lui=english&language=english`
                    + `&query=${encodeURIComponent(query)}&cat=images&qadf=${unsafe ? "none" : "heavy"}`

                return enqueue(clientImgQueries[provider], () =>
                    cuimpClient.get(searchUrl).then((res) => {
                        const resJSON = JSON.parse(res.data.toString().match(/React\.createElement\(UIStartpage\.AppSerpImages, (\{"render".+\})\)/)[1])

                        const images = resJSON.render.presenter.regions.mainline
                            .sort((a, b) => b.presented_count - a.presented_count)
                            .map((query) => query.results.map(
                                (result) => {
                                    const url = result.rawImageUrl ?? decodeURIComponent(result.thumbnailUrl.replace("/av/proxy-image?piurl=", ""))

                                    return {
                                        title: result.title,
                                        image: url,
                                        url: result.displayUrl ?? url
                                    }
                                }
                            ))
                            .flat()
                            .filter(filterResults)

                        return images
                    }).catch(() => {
                        clientImgQueries[provider].cooldown = true
                        setTimeout(() => clientImgQueries[provider].cooldown = false, 60_000 * 5)
                        return failImageResults
                    }))
            }

            case "google": {
                return enqueue(clientImgQueries[provider], () =>
                    gis({
                        searchTerm: query,
                        queryStringAddition: `&safe=${unsafe ? "images" : "active"}`
                    }).then((results) => {
                        const images = results.map(
                            result => {
                                const url = result.url.replace(/\\u([a-z0-9]){4}/g, (match) =>
                                    String.fromCharCode(Number("0x" + match.substring(2, match.length)))
                                )

                                return {
                                    title: "Google Image Result",
                                    image: url, url
                                }
                            }
                        ).filter(filterResults)

                        return images
                    }).catch(() => {
                        clientImgQueries[provider].cooldown = true
                        setTimeout(() => clientImgQueries[provider].cooldown = false, 60_000 * 5)
                        return failImageResults
                    }))
            }
        }
    }

    let searchResults = failImageResults
    for (const provider of searchProvider ? [searchProvider] : providerSearchOrder) {
        const lastProviderResults = clientImgResults[provider]?.[query]?.results ?? clientImgResults[provider]?.[query]
        const lastProviderSearch = clientImgResults[provider]?.[query]?.lastSearch ?? 0

        if ((Date.now() - lastProviderSearch) < 60_000 * 30) return lastProviderResults
        if (clientImgQueries[provider]?.cooldown) return lastProviderResults ?? failImageResults

        searchResults = await performProviderSearch(provider).catch(() => { }) ?? failImageResults
        if (searchResults != failImageResults) {
            clientImgResults[provider] ??= {}
            clientImgResults[provider][query] = {
                lastSearch: Date.now(),
                results: searchResults
            }

            fs.writeJSONSync("data/imagesearchdata.json", clientImgResults)

            return searchResults
        }
    }

    return searchResults
}

async function uploadToFileHost(file) {
    const filename = path.basename(file)

    const uploadHosts = [
        async () => {
            const form = new FormData()

            form.append("files[]", fs.readFileSync(file), filename)

            return axiosClient.post(
                "https://uguu.se/upload.php",
                form,
                {
                    headers: {
                        ...clientHeaders,
                        ...form.getHeaders(),
                        "Referer": "https://uguu.se/"
                    }
                }
            ).then((res) => res.data?.files?.[0]?.url)
        },
        async () => {
            const form = new FormData()

            form.append("file", fs.readFileSync(file), filename)

            return axiosClient.post(
                "https://frisk.page/api/files/upload",
                form,
                {
                    headers: {
                        ...clientHeaders,
                        ...form.getHeaders(),
                        "Referer": "https://frisk.page/"
                    }
                }
            ).then((res) => res.data?.file_url)
        },
        async () => catbox.upload(file),
        async () => litterbox.upload(file)
    ]

    let lastResponse = "Unable to upload to a file hosting service."

    for (const upload of uploadHosts) {
        const uploadLink = await upload().catch(() => { })
        if (uploadLink) {
            if (validUrl.test(uploadLink)) return uploadLink
            lastResponse = uploadLink
        }
    }

    return lastResponse
}

module.exports = {
    fetchImages,
    uploadToFileHost
}
