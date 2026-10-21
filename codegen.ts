import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'graphql/schema.graphql',
  documents: ['src/**/*.ts', 'src/**/*.tsx', '!src/lib/graphql/__generated__/**'],
  ignoreNoDocuments: false,
  generates: {
    'src/lib/graphql/__generated__/': {
      preset: 'client',
      config: {
        documentMode: 'string',
        strictScalars: true,
        useTypeImports: true,
        scalars: {
          DateTime: 'string',
        },
      },
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
}

export default config
