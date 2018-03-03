const path = require('path')
const {xml2js, js2xml} = require('xml-js')
const fs = require('fs')
const glob = require('glob')

const {
    CONFIG_FILENAME,
    ERROR_CONFIG_FILE_LOADING,
    ERROR_MISSING_CONTENT,
    ERROR_MISSING_SVGS,
    ERROR_OPTIONS_TYPE,
    ERROR_WHITELIST_TYPE
} = require('./constants')

const defaultOptions = {
    content: [],
    svgs: [],
    whitelist: {'*': new Set}
}

const removeDuplicates = (filePath, index, array) => array.indexOf(filePath) ===
    index
const flatten = (arr, initialVal) => [...arr, ...initialVal]

class PurgeSvg {
    constructor (options) {
        if (typeof options === 'string' || typeof options === 'undefined') {
            options = PurgeSvg.loadConfigFile(options)
        }

        PurgeSvg.validateOptions(options)

        this.options = Object.assign(defaultOptions, options)
    }

    static loadConfigFile (configFile = CONFIG_FILENAME) {
        try {
            return require(
                path.resolve(process.cwd(), configFile)
            )
        } catch (e) {
            throw new Error(ERROR_CONFIG_FILE_LOADING)
        }
    }

    static validateOptions (options) {
        if (typeof options !== 'object') {
            throw new TypeError(ERROR_OPTIONS_TYPE)
        }
        if (!options.content || !options.content.length) {
            throw new TypeError(ERROR_MISSING_CONTENT)
        }
        if (!options.svgs || !options.svgs.length) {
            throw new TypeError(ERROR_MISSING_SVGS)
        }
        if (options.whitelist && (typeof options.whitelist !== 'object' || Array.isArray(options.whitelist) )) {
            throw new TypeError(ERROR_WHITELIST_TYPE)
        }
    }

    static globPaths (paths) {
        if (typeof paths === 'string') {
            paths = [paths]
        }

        return paths.map(filePath => {
            if (fs.existsSync(filePath)) {
                return [filePath]
            }

            return [...glob.sync(filePath, {nodir: true})]
        })
            .reduce(flatten, [])
            .filter(removeDuplicates)
            .map(filePath => path.resolve(filePath))
    }

    static prepareSvgPaths (svgs) {
        let svgArray = []

        svgs.forEach((svg) => {
            if (typeof svg === 'string') {
                svg = {in: svg}
            }

            let paths = fs.existsSync(svg.in) ? [svg.in] : glob.sync(svg.in, {nodir: true})

            paths.forEach((svgPath) => {
                let out = svg.out || path.resolve(svgPath).replace('.svg', '.purged.svg')

                // check if output is a folder
                if (!out.endsWith('.svg')) {
                    out = path.format({
                        dir: out,
                        base: path.basename(svgPath)
                    })
                }

                svgArray.push({
                    filename: path.basename(svgPath),
                    in: path.resolve(svgPath),
                    out,
                    prefix: svg.prefix || ''
                })
            })
        })

        return svgArray
    }

    static extractContentIds (content) {
        const regex = /xlink:href="([\S]+)#([\S]+)"/g

        let icons = {}
        PurgeSvg.globPaths(content).map(filePath => {
            let m
            let content = fs.readFileSync(filePath, 'utf-8')

            while ((m = regex.exec(content)) !== null) {
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++
                }

                let svgFile = path.basename(m[1])

                if (!(icons[svgFile] instanceof Set)) {
                    icons[svgFile] = new Set
                }

                icons[svgFile].add(m[2])
            }
        })

        return icons
    }

    purge () {
        const contentIds = PurgeSvg.extractContentIds(this.options.content)

        let outSvgs = {}

        PurgeSvg.prepareSvgPaths(this.options.svgs).forEach((svgObj) => {
            let ids = new Set([
                ...(contentIds[svgObj.filename] || []),
                ...(this.options.whitelist[svgObj.filename] || []),
                ...(this.options.whitelist['*'] || []),
            ])

            const svg = xml2js(fs.readFileSync(svgObj.in, 'utf8'), {compact: true})
            if (!Array.isArray(svg.svg.symbol)) {
                svg.svg.symbol = [svg.svg.symbol]
            }

            if ( !Array.isArray(outSvgs[svgObj.out]) )
                outSvgs[svgObj.out] = [];

            outSvgs[svgObj.out].push(
                ...svg.svg.symbol.filter((s) => ids.has(s._attributes.id))
            )
        })

        for (let filename in outSvgs) {
            let svg = {
                _declaration: {
                    _attributes: {
                        version: '1.0',
                        encoding: 'UTF-8'
                    }
                },
                svg: {
                    _attributes: {
                        xmlns: 'http://www.w3.org/2000/svg',
                        style: 'display: none;'
                    },
                    symbol: outSvgs[filename]
                }
            }

            if ( !fs.existsSync( path.dirname(filename) ) ) {
                fs.mkdirSync(path.dirname(filename))
            }

            fs.writeFileSync(filename, js2xml(svg, {compact: true, spaces: 2}))
        }
    }
}

module.exports = PurgeSvg
