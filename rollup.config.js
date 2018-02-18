import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'lib/purgesvg.es.js',
            format: 'es'
        },
        {
            file: 'lib/purgesvg.js',
            format: 'cjs'
        }
    ],
    plugins: [
        babel(),
        uglify()
    ]
}
