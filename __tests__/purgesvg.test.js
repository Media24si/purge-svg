/* eslint no-new: "off" */

import PurgeSvg from './../src'
import {
    ERROR_CONFIG_FILE_LOADING,
    ERROR_MISSING_CONTENT,
    ERROR_MISSING_SVGS,
    ERROR_WHITELIST_TYPE
} from './../src/constants'

describe('initialize purgesvg', () => {
    it('throws an error without options', () => {
        expect(() => {
            new PurgeSvg()
        }).toThrow(Error)
    })

    it('throws an error with invalid config path', () => {
        expect(() => {
            new PurgeSvg('invalid.config.js')
        }).toThrow(ERROR_CONFIG_FILE_LOADING)
    })

    it('throws an error without content option', () => {
        expect(() => {
            new PurgeSvg({
                svgs: ['icons.svg']
            })
        }).toThrow(ERROR_MISSING_CONTENT)

        expect(() => {
            new PurgeSvg({
                svgs: ['icons.svg'],
                content: []
            })
        }).toThrow(ERROR_MISSING_CONTENT)
    })

    it('throws an error without svgs option', () => {
        expect(() => {
            new PurgeSvg({
                content: 'index.html'
            })
        }).toThrow(ERROR_MISSING_SVGS)

        expect(() => {
            new PurgeSvg({
                content: 'index.html',
                svgs: []
            })
        }).toThrow(ERROR_MISSING_SVGS)
    })

    it('throws an error with an incorrect whitelist option', () => {
        expect(() => {
            new PurgeSvg({
                content: 'index.html',
                svgs: 'icons.svg',
                whitelist: {}
            })
        }).toThrow(ERROR_WHITELIST_TYPE)
    })

    it('sets up options when providing an object', () => {
        const ps = new PurgeSvg({
            content: ['index.html'],
            svgs: ['icons.svg']
        })

        expect(ps.options).toMatchObject({
            content: ['index.html'],
            svgs: ['icons.svg']
        })
    })

    it('sets up options from a config file', () => {
        const ps = new PurgeSvg('./__tests__/test_examples/purgesvg.config.js')

        expect(ps.options).toMatchObject({
            content: ['./__tests__/test_examples/a-file.html'],
            svgs: ['./__tests__/test_examples/a-file.svg']
        })
    })
})
