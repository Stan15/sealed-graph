import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import dts from "rollup-plugin-dts";

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                dir: 'dist',
                format: 'es',
            }
        ],
        plugins: [
            typescript(),
            del({ targets: 'dist/*' })
        ]
    },
    {
        input: 'dist/dts/index.d.ts',
        output: [{ file: 'dist/index.d.ts', format: 'es' }],
        plugins: [
            dts(),
            del({ targets: 'dist/dts', hook: 'buildEnd' })
        ]
    }
]