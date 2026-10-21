import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { buildSchema } from 'graphql'

const [source, revision] = process.argv.slice(2)
if (!source || !revision) {
  throw new Error('Uso: npm run schema:sync -- /caminho/schema.gql revisao-do-backend')
}
const text = await readFile(source, 'utf8')
const schema = buildSchema(text)
for (const name of ['createMobileSession', 'refreshMobileSession', 'revokeMobileSession']) {
  if (!schema.getMutationType()?.getFields()[name])
    throw new Error(`Schema sem a operação ${name}; nenhum arquivo foi alterado.`)
}
if (!schema.getQueryType()?.getFields().mobileMe)
  throw new Error('Schema sem mobileMe; nenhum arquivo foi alterado.')
await writeFile('graphql/schema.graphql', text)
const hash = createHash('sha256').update(text).digest('hex')
await writeFile(
  'graphql/schema-source.md',
  `# Origem do schema\n\nBackend: sindico-pro-server, revisão ${revision}.\n\nSHA-256 do schema: ${hash}.\n\nSincronização explícita a partir do schema do backend, sem conexão ao banco. Validar o mesmo contrato no ambiente alvo antes do teste integrado.\n`,
)
console.log('Schema mobile atualizado e validado. Execute npm run codegen.')
