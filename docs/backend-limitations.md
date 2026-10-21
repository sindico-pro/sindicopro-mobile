# Limitações do backend que afetam o app

Fatos conferidos em `sindico-pro-server` (`src/auth/auth.service.ts`, guards e `src/schema.gql`). Nenhuma destas correções foi feita. O app convive com elas. Mudança de contrato de produção precisa de aprovação.

## Sessão

- Access token e refresh token duram 30 dias. O access token não é revogado no logout nem quando a conta fica inativa: `AccessTokenStrategy` só valida a assinatura e se a conta existe.
- `PersonAccount.refreshToken` é um único valor, em texto puro. Cada login, no app ou no web, substitui o refresh anterior. O último login ganha o slot.
- `refreshTokenClientSide` verifica o refresh com `JWT_REFRESH_SECRET`, mas `renewAccessToken` assina o refresh novo com `JWT_SECRET`. A segunda renovação falha, a menos que os dois segredos sejam iguais em produção. Isso não foi confirmado no ambiente.
- Se o refresh não bate com o slot, o backend chama `signOut` e zera o refresh da conta. O access token do web continua válido, porque o web não usa o refresh.
- `signOut(personId)` é público. O app só o chama depois de limpar a sessão local.

O web (`sindico-pro-web`) grava o refresh e nunca o envia. O logout web só apaga cookies. Por isso o app não invalida a sessão web.

## Autorização e dados

- Não há guard global. Várias queries usadas pelo produto, inclusive `getCondosByPerson`, aceitam um `person_id` sem exigir o token. O app envia o id da sessão e o bearer quando a operação é autenticada, mas o risco de IDOR continua no servidor.
- `PermissionGuard` libera a request quando não há header. Permissão vazia também libera. O síndico dono (`created_by_person_id` nulo) passa em qualquer feature.
- O login não tem limite de tentativas. O app não repete `createSession` sozinho.
- Erros GraphQL não têm código de domínio estável. `UnauthorizedException` vira `UNAUTHENTICATED`. O texto mistura inglês e português, e o app traduz só as mensagens conhecidas do login.
- Ocorrências não paginam. Parte do kanban também devolve listas inteiras. `getKanbanDashboard` calcula métricas invertidas e `KanbanCard.occurrence` está com o tipo errado no schema. Não usar essas queries até corrigir.
- Upload de ocorrência e tarefa é `POST /upload/:userId`, sem autenticação. Não há URL pré-assinada nem token de push mobile. A chave privada VAPID de Web Push está no código do server.

## O que o app faz enquanto isso

- Guarda os tokens só no SecureStore e na memória.
- Renova o access token uma vez, em uma única chamada compartilhada, e desiste se a renovação falhar por autenticação.
- Não promete sessão infinita nem vários aparelhos com refresh simultâneo.
- Seleciona só os campos necessários de condomínio, sem os relacionamentos que geram N+1.
