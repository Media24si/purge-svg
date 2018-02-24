import path from 'path'
import { xml2js, js2xml } from 'xml-js'
import fs from 'fs'
import glob from 'glob'

import {
    CONFIG_FILENAME,
    ERROR_CONFIG_FILE_LOADING,
    ERROR_MISSING_CONTENT,
    ERROR_MISSING_SVGS,
    ERROR_OPTIONS_TYPE,
    ERROR_WHITELIST_TYPE,
    ERROR_OUTPUT_TYPE
} from './constants'

const defaultOptions = {
    content: [],
    svgs: [],
    whitelist: [],
    output: undefined
}

const removeDuplicates = (filePath, index, array) => array.indexOf(filePath) === index
const flatten = (arr, initialVal) => [...arr, ...initialVal]

class PurgeSvg {
    options

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
        if (!options.output || typeof options.output !== 'string') {
            throw new TypeError(ERROR_OUTPUT_TYPE)
        }
        if (options.whitelist && !Array.isArray(options.whitelist)) {
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

            return [...glob.sync(filePath, { nodir: true })]
        })
            .reduce(flatten, [])
            .filter(removeDuplicates)
            .map(filePath => path.resolve(filePath))
    }

    static extractContentIds (content) {
        return PurgeSvg.globPaths(content)
            .map(filePath => {
                return fs.readFileSync(filePath, 'utf-8')
                    .match(/\.svg#([A-Za-z0-9_-]+)"/g)
                    .map(str => str.slice(5, -1))
            })
            .reduce(flatten, [])
            .filter(removeDuplicates)
    }

    purge () {
        let { content, svgs, output } = this.options
        const contentIds = PurgeSvg.extractContentIds(content)

        output = path.resolve(output)

        if (!fs.existsSync(output)) {
            fs.mkdirSync(output)
        }

        const removeUnneededSymbols = s => contentIds.includes(s._attributes.id)

        PurgeSvg.globPaths(svgs)
            .forEach(svgPath => {
                const svg = xml2js(fs.readFileSync(svgPath, 'utf8'), { compact: true })

                if (!Array.isArray(svg.svg.symbol)) {
                    svg.svg.symbol = [svg.svg.symbol]
                }

                svg.svg.symbol = svg.svg.symbol.filter(removeUnneededSymbols)

                const outputFile = path.resolve(output, path.basename(svgPath))

                fs.writeFileSync(outputFile, js2xml(svg, { compact: true, spaces: 2 }))
            })
    }
}

export default PurgeSvg
