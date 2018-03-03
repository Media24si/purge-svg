/* eslint no-new: "off" */
const appRoot = require('app-root-path')

const PurgeSvg = require('./../src')

const root = './__tests__/test_examples/'
const rootPath = appRoot.path

describe('svg paths generation', () => {
    it('should change filepath to object with full data', () => {
        expect(PurgeSvg.prepareSvgPaths([`${root}clean_svgs/icons.svg`])).toEqual([
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons.purged.svg`,
                prefix: ''
            }
        ])

        expect(PurgeSvg.prepareSvgPaths([
            `${root}clean_svgs/icons.svg`,
            `${root}clean_svgs/icons-2.svg`
        ])).toEqual([
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons.purged.svg`,
                prefix: ''
            },
            {
                filename: 'icons-2.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.purged.svg`,
                prefix: ''
            }
        ])
    })

    it('should keep same name but set folder for output', () => {
        expect(PurgeSvg.prepareSvgPaths([
            {in: `${root}clean_svgs/icons.svg`, 'out': '/foo/bar'}
        ])).toEqual([
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `/foo/bar/icons.svg`,
                prefix: ''
            }
        ])

        expect(PurgeSvg.prepareSvgPaths([
            {in: `${root}clean_svgs/icons.svg`, 'out': '/foo/bar'},
            {in: `${root}clean_svgs/icons-2.svg`, 'out': '/foo/bar'}
        ])).toEqual([
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `/foo/bar/icons.svg`,
                prefix: ''
            },
            {
                filename: 'icons-2.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.svg`,
                out: `/foo/bar/icons-2.svg`,
                prefix: ''
            }
        ])
    })

    it('should change glob path to array of objects', () => {
        expect(PurgeSvg.prepareSvgPaths([`${root}clean_svgs/*.svg`])).toEqual([
            {
                filename: 'icons-2.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.purged.svg`,
                prefix: ''
            },
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons.purged.svg`,
                prefix: ''
            }
        ])
    })

    it('should change object with only in to full object', () => {
        expect(PurgeSvg.prepareSvgPaths([{in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`}])).toEqual([
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons.purged.svg`,
                prefix: ''
            }
        ])
    })

    it('should change object with only in (glob) to full object', () => {
        expect(PurgeSvg.prepareSvgPaths([{in: `${rootPath}/__tests__/test_examples/clean_svgs/*.svg`}])).toEqual([
            {
                filename: 'icons-2.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.purged.svg`,
                prefix: ''
            },
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/clean_svgs/icons.purged.svg`,
                prefix: ''
            }
        ])
    })

    it('should leave full object', () => {
        expect(PurgeSvg.prepareSvgPaths([{
            in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
            out: `${rootPath}/__tests__/test_examples/test_folder/icons.svg`,
            prefix: 'foo'
        }])).toEqual([
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/test_folder/icons.svg`,
                prefix: 'foo'
            }
        ])
    })

    it('should levt object with glob path', () => {
        expect(PurgeSvg.prepareSvgPaths([{
            in: `${rootPath}/__tests__/test_examples/clean_svgs/*.svg`,
            out: `${rootPath}/__tests__/test_examples/test_folder/icons.svg`,
            prefix: 'foo'
        }])).toEqual([
            {
                filename: 'icons-2.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons-2.svg`,
                out: `${rootPath}/__tests__/test_examples/test_folder/icons.svg`,
                prefix: 'foo'
            },
            {
                filename: 'icons.svg',
                in: `${rootPath}/__tests__/test_examples/clean_svgs/icons.svg`,
                out: `${rootPath}/__tests__/test_examples/test_folder/icons.svg`,
                prefix: 'foo'
            }
        ])
    })
})
