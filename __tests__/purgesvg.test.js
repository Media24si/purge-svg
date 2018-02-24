/* eslint no-new: "off" */
import appRoot from 'app-root-path'
import fs from 'fs'
import { xml2js } from 'xml-js'

import PurgeSvg from './../src'
import {
    ERROR_CONFIG_FILE_LOADING,
    ERROR_MISSING_CONTENT,
    ERROR_MISSING_SVGS,
    ERROR_WHITELIST_TYPE,
    ERROR_OUTPUT_TYPE
} from './../src/constants'

const deleteFolderRecursive = path => {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(file => {
            const curPath = `${path}/${file}`

            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })

        fs.rmdirSync(path)
    }
}

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

    it('throws an error with invalid output path', () => {
        expect(() => {
            new PurgeSvg({
                svgs: ['icons.svg'],
                content: ['index.html']
            })
        }).toThrow(ERROR_OUTPUT_TYPE)

        expect(() => {
            new PurgeSvg({
                svgs: ['icons.svg'],
                content: ['index.html'],
                output: {}
            })
        }).toThrow(ERROR_OUTPUT_TYPE)

        expect(() => {
            new PurgeSvg({
                svgs: ['icons.svg'],
                content: ['index.html'],
                output: []
            })
        }).toThrow(ERROR_OUTPUT_TYPE)
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
                output: './a-folder/',
                whitelist: {}
            })
        }).toThrow(ERROR_WHITELIST_TYPE)

        expect(() => {
            new PurgeSvg({
                content: 'index.html',
                svgs: 'icons.svg',
                output: './a-folder/',
                whitelist: 'invalid'
            })
        }).toThrow(ERROR_WHITELIST_TYPE)
    })

    it('sets up options when providing an object', () => {
        const ps = new PurgeSvg({
            content: ['index.html'],
            svgs: ['icons.svg'],
            output: './a-folder/'
        })

        expect(ps.options).toMatchObject({
            content: ['index.html'],
            svgs: ['icons.svg']
        })
    })

    it('sets up options from a config file', () => {
        const ps = new PurgeSvg('./__tests__/test_examples/purgesvg.config.js')

        expect(ps.options).toMatchObject({
            content: ['./__tests__/test_examples/extract_content_ids/index.html'],
            svgs: ['./__tests__/test_examples/svgs/icons.svg'],
            output: './__tests__/test_examples/temp/'
        })
    })
})

const root = './__tests__/test_examples/'
const rootPath = appRoot.path

describe('full file path generation', () => {
    it('should change paths to absolute', () => {
        const paths = PurgeSvg.globPaths([
            `${root}paths/index.html`,
            `${root}paths/index-2.html`
        ])

        expect(paths.sort()).toEqual([
            `${rootPath}/__tests__/test_examples/paths/index.html`,
            `${rootPath}/__tests__/test_examples/paths/index-2.html`
        ].sort())
    })

    it('should change paths to absolute and find files by pattern', () => {
        const paths = PurgeSvg.globPaths([
            `${root}paths/**/*.html`,
            `${root}paths/index.php`
        ])

        expect(paths.sort()).toEqual([
            `${rootPath}/__tests__/test_examples/paths/index.php`,
            `${rootPath}/__tests__/test_examples/paths/index.html`,
            `${rootPath}/__tests__/test_examples/paths/index-2.html`
        ].sort())
    })

    it('should remove duplicate path keys', () => {
        const paths = PurgeSvg.globPaths([
            `${root}paths/**/*.html`,
            `${root}paths/index.html`
        ])

        expect(paths.sort()).toEqual([
            `${rootPath}/__tests__/test_examples/paths/index.html`,
            `${rootPath}/__tests__/test_examples/paths/index-2.html`
        ].sort())
    })
})

describe('content svg id-s extraction method', () => {
    it('should extract ids from a content file', () => {
        const ids = PurgeSvg.extractContentIds(`${root}extract_content_ids/index.html`)

        expect(ids).toEqual(['bookmark'])
    })

    it('should extract ids from multiple content file', () => {
        const ids = PurgeSvg.extractContentIds([
            `${root}extract_content_ids/index.html`,
            `${root}extract_content_ids/index.php`
        ])

        expect(ids.sort()).toEqual([
            `bookmark`,
            `calendar`
        ].sort())
    })

    it('should remove duplicate ids from array', () => {
        const ids = PurgeSvg.extractContentIds(`${root}extract_content_ids/*`)

        expect(ids.sort()).toEqual([
            `bookmark`,
            `calendar`,
            'building'
        ].sort())
    })
})

describe('purge method', () => {
    const tempFolder = `${rootPath}/__tests__/test_examples/clean_svgs/temp/`

    beforeEach(() => {
        if (fs.existsSync(tempFolder)) {
            deleteFolderRecursive(tempFolder)
        }

        expect(fs.existsSync(tempFolder)).toBeFalsy()
    })

    afterEach(() => {
        deleteFolderRecursive(tempFolder)

        expect(fs.existsSync(tempFolder)).toBeFalsy()
    })

    it('should create a new svg file without unneeded symbols', () => {
        const iconPath = `${rootPath}/__tests__/test_examples/clean_svgs/temp/icons.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/clean_svgs/index.html',
            svgs: './__tests__/test_examples/clean_svgs/icons.svg',
            output: './__tests__/test_examples/clean_svgs/temp/'
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'), { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeFalsy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })

    it('should work with single symbol too as it is not an array by default', () => {
        const iconPath = `${rootPath}/__tests__/test_examples/clean_svgs/temp/icons-2.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/clean_svgs/index.html',
            svgs: './__tests__/test_examples/clean_svgs/icons-2.svg',
            output: './__tests__/test_examples/clean_svgs/temp/'
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'), { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeFalsy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })
})
