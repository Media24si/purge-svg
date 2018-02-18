/* eslint no-new: "off" */

import PurgeSvg from './../src'

describe('initializa purgesvg', () => {
    it('throw an error without options', () => {
        expect(() => {
            new PurgeSvg()
        }).toThrow(Error)
    })
})
