import path from 'path'
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
}

export default PurgeSvg
