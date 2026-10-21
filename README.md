# Síndico Pro Mobile

Aplicativo Expo SDK 58 / React Native com login GraphQL, dashboard de identificação e logout. Desenvolvimento em `codex-login`; backend correspondente em `codex-mobile-auth` no repositório `sindico-pro-server`.

## Antes de testar

O app usa as operações **novas** `createMobileSession`, `refreshMobileSession`, `mobileMe` e `revokeMobileSession`. Ele não chama o login, refresh ou logout legados do site.

O backend de teste precisa conter essa branch e a tabela `mobile_sessions`, definida pela migration `20261021150000_mobile_sessions`. A migration foi preparada, mas **não foi aplicada por esta tarefa**. Preparar um banco isolado e aplicar as migrations mediante autorização do responsável pelo ambiente. Não apontar os testes para produção nem compartilhar segredos do servidor com o app.

## Executar

```bash
npm ci
cp .env.example .env.local
```

Defina `EXPO_PUBLIC_GRAPHQL_URL` com a URL completa do GraphQL do backend de teste. Em celular físico, use o endereço do computador acessível na rede; `localhost` no aparelho aponta para o próprio aparelho. No emulador Android, o host normalmente é `10.0.2.2`. HTTP é aceito só em desenvolvimento; builds de distribuição exigem HTTPS.

```bash
npm start
```

Abra em um runtime compatível com SDK 58. Para binário nativo próprio, use development build via Expo/EAS; não edite diretórios nativos gerados à mão. O preview web pode ser iniciado com `npm run web`, mas sua sessão fica apenas em memória. Persistência deve ser validada em Android/iOS.

## Fluxo implementado

- E-mail e senha validados; mostrar/ocultar senha, autofill e proteção contra submissão duplicada.
- Autenticação real no Nest; nenhuma senha persistida.
- Access token em memória e refresh mínimo no SecureStore, vinculado ao ambiente.
- Na reabertura, refresh e identidade confirmados antes de liberar o dashboard.
- Renovação coordenada, timeout e recuperação de rede/armazenamento.
- Logout local independente da rede, tentativa de revogar somente a sessão atual e indicação quando o servidor não confirmou a saída.
- Proteção de rotas, limpeza do cache e proteção contra respostas de uma sessão anterior.

O dashboard inicial mostra somente nome/e-mail da conta ativa. Não há restrição nova por perfil nem acesso a métricas, listas operacionais ou dados de terceiros; os próximos módulos precisarão de autorização efetiva por contexto/condomínio no backend.

## Verificação

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
npm run codegen:check
npx expo install --check
npx expo-doctor
```

Os testes Jest usam `jest-expo`, React Native Testing Library e Expo Router; Watchman está desabilitado para rodar também em ambientes isolados.

## Contratos GraphQL

O schema é versionado dentro do mobile, sem exigir outro checkout para instalar, gerar tipos ou testar. Para atualizar conscientemente a partir de uma revisão do backend:

```bash
npm run schema:sync -- ../sindico-pro-server/src/schema.gql REVISAO_DO_BACKEND
npm run codegen
npm run codegen:check
```

A sincronização exige as operações mobile e registra SHA-256/procedência; não modifica o backend nem conecta ao banco. Revise o diff antes de publicar.

Veja [arquitetura implementada](docs/architecture.md), [dependência de backend](docs/backend-limitations.md) e [validação e testes pendentes](docs/validacao-login.md). O [planejamento original](docs/plano-login.md) permanece como histórico.
