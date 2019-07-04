/* eslint no-new: "off" */
const appRoot = require('app-root-path')
const PurgeSvg = require('./../src')

const root = './__tests__/test_examples/'
const rootPath = appRoot.path

describe('full file path generation', () => {
    it('should change paths to absolute', () => {
        const paths = PurgeSvg.globPaths([
            `${root}paths/index.html`,
            `${root}paths/index-2.html`,
        ])

        expect(paths.sort()).toEqual([
            `${rootPath}/__tests__/test_examples/paths/index.html`,
            `${rootPath}/__tests__/test_examples/paths/index-2.html`,
        ].sort())
    })

    it('should change paths to absolute and find files by pattern', () => {
        const paths = PurgeSvg.globPaths([
            `${root}paths/**/*.html`,
            `${root}paths/index.php`,
        ])

        expect(paths.sort()).toEqual([
            `${rootPath}/__tests__/test_examples/paths/index.php`,
            `${rootPath}/__tests__/test_examples/paths/index.html`,
            `${rootPath}/__tests__/test_examples/paths/index-2.html`,
        ].sort())
    })

    it('should remove duplicate path keys', () => {
        const paths = PurgeSvg.globPaths([
            `${root}paths/**/*.html`,
            `${root}paths/index.html`,
        ])

        expect(paths.sort()).toEqual([
            `${rootPath}/__tests__/test_examples/paths/index.html`,
            `${rootPath}/__tests__/test_examples/paths/index-2.html`,
        ].sort())
    })
})
