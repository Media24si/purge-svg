/* eslint no-new: "off" */
const PurgeSvg = require('./../src')
const root = './__tests__/test_examples/'

describe('content svg id-s extraction method', () => {
    it('should extract ids from a content file', () => {
        const ids = PurgeSvg.extractContentIds(
            `${root}extract_content_ids/index.html`)

        expect(ids).toEqual({
            'icons.svg': new Set(['bookmark']),
        })
    })

    it('should extract ids from multiple content file', () => {
        const ids = PurgeSvg.extractContentIds([
            `${root}extract_content_ids/index.html`,
            `${root}extract_content_ids/index.php`,
        ])

        expect(ids).toEqual({
            'icons.svg': new Set(['bookmark', 'calendar']),
        })
    })

    it('should remove duplicate ids from array', () => {
        const ids = PurgeSvg.extractContentIds(`${root}extract_content_ids/index*`)

        expect(ids).toEqual({
            'icons.svg': new Set([`bookmark`, `calendar`, 'building']),
        })
    })

    it('should extract only filenames from paths', () => {
        const ids = PurgeSvg.extractContentIds(
            `${root}extract_content_ids/multiple_files.html`)

        expect(ids).toEqual({
            'icons.svg': new Set(['bookmark', 'money']),
            'foo.svg': new Set(['rocket']),
            'bar.svg': new Set(['euro']),
        })
    })
})
