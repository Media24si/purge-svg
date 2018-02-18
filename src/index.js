import path from 'path'

import {
    CONFIG_FILENAME,
    ERROR_CONFIG_FILE_LOADING,
    ERROR_OPTIONS_TYPE,
    ERROR_MISSING_CONTENT,
    ERROR_MISSING_SVGS,
    ERROR_WHITELIST_TYPE
} from './constants'

const defaultOptions = {
    content: [],
    svgs: [],
    whitelist: []
}

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
        if (options.whitelist && !Array.isArray(options.whitelist)) {
            throw new TypeError(ERROR_WHITELIST_TYPE)
        }
    }
}

export default PurgeSvg
