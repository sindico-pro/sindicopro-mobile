# Arquitetura do Síndico Pro Mobile

Primeiro incremento: login real, sessão segura, painel inicial e logout. O app é um cliente do GraphQL já existente em `sindico-pro-server`. Não altera o backend nem o web.

## Estrutura

```text
graphql/schema.graphql          snapshot do schema commitado na main do server
codegen.ts
src/app/                        rotas do Expo Router
  (auth)/sign-in.tsx
  (app)/index.tsx               painel
src/features/<domínio>/         api, sessão, hooks, componentes e testes
src/lib/                        env, cliente GraphQL, QueryClient
src/components/ui/              Button, TextField, Screen, StateView
src/constants/theme.ts          cores da marca e Maven Pro
```

Um módulo novo (ocorrências, tarefas, moradores) entra como `src/features/<módulo>` e rotas em `src/app/(app)/<módulo>`. Não criar camadas extras antes de existir uma segunda implementação real.

## Decisões

1. **TanStack Query + `fetch`.** O cache é por query key, com `personId` quando os dados são do usuário. `onlineManager` escuta `expo-network` e `focusManager` escuta `AppState`. Queries de rede ou timeout tentam de novo até duas vezes. Mutations não. O Apollo foi descartado: o web não usa cache normalizado, e o backend pagina por página fixa, não por cursor.
2. **GraphQL Codegen `client-preset` com `documentMode: string`.** As operações em `src/features/*/api/operations.ts` são a fonte do contrato. `npm run schema:sync` copia `main:src/schema.gql` do server, sem usar o working tree local. `npm run codegen` gera `src/lib/graphql/__generated__`. O runtime não depende do pacote `graphql`.
3. **Estado.** Dados remotos ficam só no TanStack Query. A sessão fica no `SessionProvider` (reducer `restoring | signedOut | signedIn`). Tokens ficam em memória e no `expo-secure-store` (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`). Não há fallback para `localStorage`: o alvo é iOS e Android. Não há store global.
4. **Sessão.** Login usa `createSession` sem header. A resposta passa por Zod e pela política de perfil. Perfis permitidos: `condominium-manager`, `external-condominium-manager`, `sub-condominium-manager` e `isEmployee`. Os tokens só são gravados depois dessa checagem. No boot, o splash espera a fonte e a leitura local. Access token vencido tenta `refreshTokenClientSide` uma vez. Falha de autenticação limpa a sessão. Falha de rede mantém a sessão e mostra o aviso offline. `personAccountByPersonId` confirma a conta em segundo plano; status `INACTIVE` encerra a sessão. Logout limpa o aparelho e o cache antes de chamar `signOut` em best-effort. O web não usa esse refresh, então o logout mobile não derruba a sessão web.
5. **Rotas.** `Stack.Protected` libera `(app)` com sessão e `(auth)` sem sessão. Deep link para o painel sem sessão cai no login.
6. **Formulários.** `react-hook-form` e Zod 3. A versão 6 de `@hookform/resolvers` conflita com o `effect` já instalado pelo Expo, então o resolver fica na 5.
7. **Interface.** Sem biblioteca de componentes. Cores da marca: `#20AD96`, `#3F3A64`, `#FFCB3F`. Fonte Maven Pro. O logo do web fica sobre fundo claro porque o SVG é escuro.

## Scripts

- `npm run schema:sync`
- `npm run codegen`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npx expo-doctor`

Variável pública: `EXPO_PUBLIC_GRAPHQL_URL` (ver `.env.example`). Em aparelho físico, `localhost` não aponta para o computador.

Limitações do backend que este cliente não contorna: [backend-limitations.md](backend-limitations.md).
