/* eslint no-new: "off" */
const appRoot = require('app-root-path')
const fs = require('fs')
const { xml2js } = require('xml-js')

const PurgeSvg = require('./../src')
const rootPath = appRoot.path

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
        const iconPath = `${tempFolder}icons.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/clean_svgs/index.html',
            svgs: [
                {
                    in: './__tests__/test_examples/clean_svgs/icons.svg',
                    out: tempFolder,
                }],
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'), { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeFalsy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })

    it('should work with single symbol too as it is not an array by default', () => {
        const iconPath = `${tempFolder}icons-2.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/clean_svgs/index-2.html',
            svgs: [
                {
                    in: './__tests__/test_examples/clean_svgs/icons-2.svg',
                    out: tempFolder,
                }],
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'), { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeFalsy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })

    it('should not remove whitelisted symbols', () => {
        const iconPath = `${tempFolder}icons.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/clean_svgs/index.html',
            svgs: [
                {
                    in: './__tests__/test_examples/clean_svgs/icons.svg',
                    out: tempFolder,
                }],
            whitelist: { '*': ['building'] },
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'),
            { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeTruthy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })

    it('should word with symbols wrapped in defs', () => {
        const iconPath = `${tempFolder}icons.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/defs_svgs/index.html',
            svgs: [
                {
                    in: './__tests__/test_examples/defs_svgs/icons.svg',
                    out: tempFolder,
                }],
            whitelist: { '*': ['building'] },
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'),
            { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeTruthy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })

    it('should not break with plain svg', () => {
        const iconPath = `${tempFolder}icons.svg`

        new PurgeSvg({
            content: './__tests__/test_examples/clean_svgs/index.html',
            svgs: [
                {
                    in: './__tests__/test_examples/clean_svgs/*.svg',
                    out: tempFolder,
                },
                {
                    in: './__tests__/test_examples/single.svg',
                    out: tempFolder,
                },
            ],
            whitelist: {},
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'), { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeFalsy()
        expect(fileContent.includes('bookmark')).toBeTruthy()
    })
})

describe('purge and merge', () => {
    const folder = `${rootPath}/__tests__/test_examples/merge/`
    const tempFolder = `${folder}temp/`

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

    it('should purge and merge if same output specified', () => {
        const iconPath = `${tempFolder}icons.svg`

        new PurgeSvg({
            content: `${folder}merge.html`,
            svgs: [
                {
                    in: `${folder}*.svg`,
                    out: iconPath,
                }],
            whitelist: {},
        }).purge()

        expect(fs.existsSync(iconPath)).toBeTruthy()

        let fileContent = xml2js(fs.readFileSync(iconPath, 'utf8'), { compact: true })
        fileContent = JSON.stringify(fileContent)

        expect(fileContent.includes('building')).toBeFalsy()
        expect(fileContent.includes('bookmark')).toBeTruthy()

        expect(fileContent.includes('right-arrow')).toBeFalsy()
        expect(fileContent.includes('close')).toBeTruthy()
    })
})
