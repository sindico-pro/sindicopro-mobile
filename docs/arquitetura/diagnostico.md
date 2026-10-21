# Diagnóstico arquitetural

Data: 20/10/2026. Leitura estática dos três projetos, concentrada em autenticação, autorização, ocorrências, tarefas e infraestrutura associada. Não é auditoria exaustiva nem comprovação da implantação.

**Legenda:** F = fato confirmado nos arquivos citados; H = hipótese que exige teste/medição; R = recomendação. Linhas referem-se à revisão local observada e podem mudar.

## 1. Backend NestJS

### Organização e contratos

**F:** entidades em `application/entities`, casos de uso injetáveis em `application/use-cases`, repositórios abstratos em `application/repositories`, implementações Prisma/mapeadores em `infra/database`, resolvers/DTOs/view models em `infra/http`. O `HttpModule` concentra muitos providers; não há um módulo Nest separado por cada domínio examinado.

Evidências: [composição](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/app.module.ts:15), [HttpModule](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/http.module.ts:687), [repositório abstrato](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/repositories/occurrences-repository.ts:15), [Prisma](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/database/repositories/prisma-occurrences-repository.ts:68).

**F:** GraphQL code-first com Apollo Server, schema gerado em `src/schema.gql` e contexto com `req`. DTOs definem tipos/campos, mas não comprovam validação semântica. Não foram encontrados `ValidationPipe`, filtro de erros ou guard globais nas configurações/buscas realizadas. Existem validações específicas em casos de uso. O TypeScript do server desabilita opções como `strictNullChecks` e `noImplicitAny`.

Evidências: [GraphQL](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/http.module.ts:691), [bootstrap](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/main.ts:6), [DTO](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/dtos/occurrence/create-occurrence.input.ts:3), [validação de status](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/use-cases/occurrence/update-occurrence-status.ts:25), [TypeScript](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/tsconfig.json:1).

**R:** preservar contratos e autoridade dos casos de uso; gerar tipos mobile por operação de um schema com origem/revisão registradas. Tipos estáticos não substituem validação em runtime.

### Autenticação e sessões

| ID | Fato confirmado | Evidência e consequência |
| --- | --- | --- |
| A1 | `createSession` valida senha e retorna pessoa e tokens; sempre atualiza o refresh token após login válido. | [AuthService](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:34). Não há opção de login sem substituir esse campo. |
| A2 | A conta tem um único `refreshToken`, armazenado como string, sem coleção de sessões por dispositivo nesse modelo. | [Prisma](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/prisma/schema.prisma:69), [gravação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:270). Web e mobile concorrem pela credencial de renovação. |
| A3 | Ambos os tokens iniciais expiram em `30d`. A renovação assina refresh com `JWT_SECRET`, mas `refreshTokenClientSide` verifica com `JWT_REFRESH_SECRET`. | [emissão](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:163), [renovação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:183), [verificação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:238). Se as chaves diferirem, o token renovado falha nessa verificação. Chaves reais não foram lidas/comparadas. |
| A4 | Token de refresh diferente pode chamar `signOut`, que limpa o campo da conta inteira. | [logout/refresh](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:203). Um cliente antigo pode interferir na renovação do mais recente. |
| A5 | A estratégia bearer verifica JWT e busca conta por pessoa, sem sessão/revogação por `sid`. Caso de uso e consulta examinados não filtram status/exclusão nessa busca. | [strategy](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/strategies/access-token.strategy.ts:16), [caso de uso](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/use-cases/person-account/get-person-account-by-person.ts:10), [consulta](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/database/repositories/prisma-person-accounts-repository.ts:48). Limpar refresh não revoga access token já emitido. |
| A6 | Perfil por token retorna dados básicos, sem os contextos/permissões do login; não verifica exclusão como o login. Login/perfil capturam exceções e retornam objetos de erro. | [perfil](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:119), [catch](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:113). Pode resultar em erro GraphQL de campo não nulo; envelope real exige teste. |

**F:** operações existentes: `createSession(CreateAuthInput)`, `getPersonInfoByToken(GetPersonInfoByTokenInput)`, `refreshToken(RefreshTokensInput)`, `refreshTokenClientSide(RefreshTokenClientSideInput)` e `signOut(personId)`. Login devolve `token`; refresh devolve `accessToken`.

Evidências: [resolver](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.resolver.ts:20), [schema](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/schema.gql:1955), [saída](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/outputs/auth.ts:6).

**H:** revisão implantada, controles no proxy, segredos e envelope efetivo de erro. Não há evidência para presumir que esses fatores resolvam A1–A6. **R:** contrato compatível com sessões simultâneas; não contornar com senha persistida, bearer copiado do web ou segredo JWT no app.

### Pessoas, condomínios e autorização

**F:** pessoa e conta são distintas. `PersonContext` tem perfil, status, condomínios, hierarquia, criador e expiração. `PersonPermission` relaciona pessoa/contexto/feature/ações/condomínio; `ProfilePermission` também é por condomínio. O seed contém síndicos externo/morador, funcionários e outros perfis, mas não prova quais existem na implantação. `isEmployee` no login deriva de criador e existência de permissão.

Evidências: [contexto](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/prisma/schema.prisma:104), [permissões](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/prisma/schema.prisma:698), [perfis](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/database/seed.ts:121), [derivação no login](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:55).

**F:** listagem de condomínios por criador usa `created_by_person_id`; para funcionário há busca adicional com `personPermissions.some`. Contextos resolvem perfil via `ResolveField`. A administração da plataforma possui guard baseado em configuração de e-mails; não equivale automaticamente ao slug `admin`.

Evidências: [condomínios por pessoa/acesso](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/database/repositories/prisma-condos-repository.ts:59), [perfil do contexto](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/person-context/persons-context.resolver.ts:172), [PlatformAdminGuard](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/guards/platform-admin.guard.ts:13).

**F:** autorização desigual nos caminhos examinados. Alguns métodos combinam `AuthorizationGuard`/`PermissionGuard`; outros não têm guard local. `PermissionGuard` permite ausência de metadata e de authorization se isolado; nos métodos em conjunto, `AuthorizationGuard` deve barrar a falta do bearer. `UserHasPermission` permite pessoa sem criador e ausência de registros, agregando ações de diferentes condomínios/features sem receber o recurso-alvo. Isso não demonstra isolamento do objeto solicitado.

Evidências: [PermissionGuard](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/guards/permission.guard.ts:23), [UserHasPermission](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/guards/user-has-permission.ts:19), [queries de tarefas](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/kanban-card/kanban-cards.resolver.ts:70), [ocorrências](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/occurrence/occurrences.resolver.ts:112).

**R:** auditar acesso por recurso antes dos módulos sensíveis. Há fluxos públicos de ocorrência; não se deve classificar todo método sem guard como defeito sem confirmar sua intenção. Guard de navegação não substitui autorização no Nest. O login não usará listas operacionais como verificação de identidade.

### Ocorrências como referência de escala

**F:** listagens por condomínio/síndico retornam arrays sem página/cursor nesse contrato. Existem filtros de status e modos como `WITHOUT_MANAGER_RESPONSE`, com inspeção de respostas no backend. Entidade inclui `OPEN`/`FROZEN`/`CLOSED`, congelamentos, anexos, unidade/bloco, respostas e tarefas vinculadas; suas transições são regras consolidadas.

Evidências: [operações](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/occurrence/occurrences.resolver.ts:89), [contrato](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/repositories/occurrences-repository.ts:3), [filtros](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/use-cases/occurrence/get-occurrences-by-condominium-manager.ts:41), [transições](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/entities/occurrence/index.ts:106).

**F:** `ResolveField` busca condomínio, respostas e cards por ocorrência. **H:** potencial N+1/custo elevado em listas; sem medição ou comprovação de cache de infraestrutura. Não foi encontrado DataLoader nas buscas. **R:** projeções de lista/detalhe, medição com volume real e paginação de backend antes de prometer rolagem infinita escalável.

Evidência: [campos relacionados](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/occurrence/occurrences.resolver.ts:161).

### Tarefas como referência de escala

**F:** quadros/colunas/cards, responsável, categoria, prioridade, posição, comentários, anexos antes/depois, ocorrência vinculada, recorrência, datas e autoria. Concluir tarefa recorrente pode criar a próxima instância; mover de coluna também registra dados de execução.

Evidências: [operações/relações](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/kanban-card/kanban-cards.resolver.ts:47), [criação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/use-cases/kanban-card/create-kanban-card.ts:50), [recorrência/execução](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/use-cases/kanban-card/update-kanban-card.ts:200).

**F:** quadro principal filtra intervalo/condomínio/título e retorna cinco concluídas junto das demais, sem página. Concluídas/relatórios têm endpoints com `page`, `total`, `take: 20` e offset. Nomes de argumentos variam (`person_id`/`personId`) e existem sentinelas `'all'`. Ordenação paginada por `updated_at` não tem desempate explícito por ID.

Evidências: [quadro](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/database/repositories/prisma-kanban-cards-repository.ts:81), [paginação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/database/repositories/prisma-kanban-cards-repository.ts:178), [assinaturas](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/kanban-card/kanban-cards.resolver.ts:93).

**H:** atualizações concorrentes podem alterar offsets e duplicar/omitir itens entre páginas. **R:** adaptadores por domínio, sem inventar contrato uniforme; testar ordenação e concorrência. `due_date` foi observado em alterações locais depois registradas em commits externos; não presumir presença em produção.

### Arquivos, notificações e testes

**F:** upload genérico REST `POST /upload/:userId`, multipart `file`/`bucket` e pasta/condomínio opcionais, retorna URL/chave. Há S3, modo local e operações privadas. O controller genérico não mostra guard, limite de tamanho ou validação MIME explícitos; controles externos/especializados não foram descartados. **R:** adaptar transporte nativo e revisar ownership/limites antes dos anexos; jamais levar chaves S3 ao app.

Evidências: [upload](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/controllers/upload-file.controller.ts:21), [storage](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/storage/s3-storage.ts:47).

**F:** central interna persistida e paginada, notificações de negócio e e-mails. Existe Web Push VAPID registrado no `HttpModule`; seu resolver contém material privado literal, cujos valores não são reproduzidos neste plano. As buscas não encontraram gateway websocket, `@Subscription` GraphQL ou cadastro de tokens Expo/APNs/FCM. Isso não comprova ausência de serviços externos. **R:** push nativo exige contrato próprio; revisar a configuração privada no servidor por trabalho autorizado, sem copiá-la ao app.

Evidências: [central](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/resolvers/notification-center/notifications-center.resolver.ts:35), [persistência](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/use-cases/notifications-center/send-in-app-notification.ts:28), [Web Push](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/web-push/subscription.resolver.ts:7), [registro](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/infra/http/http.module.ts:1290).

**F:** Vitest e testes de entidades/casos de uso coexistem com ambiente Prisma em resolvers. Nenhum teste que altera banco foi executado nesta investigação.

Evidências: [configuração](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/vite.config.ts:1), [testes de status](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/application/entities/occurrence/occurrence-status.spec.ts:1), [scripts](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/package.json:11).

## 2. Frontend Next.js

| Área | Fato confirmado e evidência | Reaproveitamento/revisão recomendados |
| --- | --- | --- |
| Organização | App Router, grupos públicos/autenticados, páginas server e componentes client próximos das features; UI compartilhada. [Layout](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/layout.tsx:7), [tarefas](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/kanban/page.tsx:20). | Preservar recorte de domínio; rotas mobile finas e lógica fora de `src/app`. |
| Comunicação | Apollo browser, cliente Apollo separado e wrappers Ky para GraphQL/REST. [Wrapper](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/contexts/apollo-wrapper.tsx:23), [cliente](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/http/graphql-client.ts:9), [Ky](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/http/api-client.ts:9). | Unificar transporte/erros; não copiar caches independentes. |
| Contratos | Codegen usa schema do repositório vizinho e gera tipos/hooks Apollo. [Codegen](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/codegen.ts:8). | Manter geração por operação; build mobile independente dos diretórios vizinhos. |
| Cache | Wrapper tem `InMemoryCache` sem políticas específicas e cria `ApolloClient` no corpo do componente. Outros caminhos usam tags Next, revalidação e refetch. [Wrapper](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/contexts/apollo-wrapper.tsx:78), [fetch](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/http/fetch-kanban-cards.ts:30), [revalidação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/occurrences/create-occurrence-modal/create-occurrence-form/index.tsx:107). | Cliente estável e invalidação por escopo. O efeito real das tags depende das opções/versão Next; não foi medido. |
| Estado | Quadro copia props para `useState`, filtra/ordena localmente e dispara mutations no drag-and-drop. [Quadro](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/kanban/kb-comp/kanban-board.tsx:99), [movimentação](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/kanban/kb-comp/components/kanban-columns.tsx:122). | Não duplicar coleções remotas em stores/contextos; UI mantém só interação/rascunhos. |
| Sessão | Server Action grava cookies de usuário/tokens/seleção; layout verifica presença. Validade dos cookies supera JWT e essa gravação não explicita `httpOnly`/`secure`/`sameSite`. [Login](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(auth)/sign-in/actions.tsx:63), [auth](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/auth/index.ts:20). | Não copiar cookies/prazos; SecureStore e verificação real da sessão. |
| Refresh | A busca por `REFRESH_TOKEN_MUTATION`/`refreshTokenClientSide`, fora dos gerados, encontrou definição, sem uso. [Definição](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/graphql/mutations/refresh-token.ts:3). | Isso não torna inofensiva a substituição da credencial. Testar coexistência com clientes legados. |
| Permissões | Helper por feature/condomínio; `'all'` devolve ações vazias. Funcionários, fornecedor e `showPanel` mudam o fluxo. [Helper](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/auth/index.ts:44), [ocorrências](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/occurrences/page.tsx:37), [painel](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/panel/page.tsx:51). | Não equiparar autenticado a síndico ou acesso irrestrito. Escopo/permissões vêm do backend. |
| Volume | Ocorrências combina OPEN/FROZEN e catálogos de blocos; filtros/ordenação locais. Tarefas usa intervalo padrão ±30 dias. [Ocorrências](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/occurrences/page.tsx:53), [filtros](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/occurrences/occurrences-list/index.tsx:107), [tarefas](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/kanban/page.tsx:75). | Projeções pequenas, listas virtualizadas e detalhe sob demanda; não baixar tudo para simular paginação. |
| Formulários | React Hook Form/Zod e conversão de horário para UTC. [Formulário](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/occurrences/create-occurrence-modal/create-occurrence-form/index.tsx:31), [schema](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/app/(app)/kanban/create-card-modal/create-card-form/schema.ts:4). | Preservar conceitos, verificar regras no server e usar controles nativos. |
| Erros | `fetchOccurrences` converte ausência de dados em array vazio; um cliente Next permite retry de POST e 4xx. [Fetch](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/http/fetch-occurrences.ts:29), [cliente Next](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/lib/next-api.ts:5). | Vazio não é falha; timeout não prova que uma mutation não foi aplicada. |
| Marca | Verde `#20AD96`, secundária `#3F3A64`, destaque `#FFCB3F`; white labels por hostname e UI Radix/Tailwind. [Marca](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/lib/white-label-config.ts:23), [botão](/Users/rogerio/Projetos/SindicoPro/sindico-pro-web/src/components/ui/button.tsx:1). | Tokens/ativos de marca nativos; CSS/DOM/hostname não são soluções mobile. |

## 3. Mobile e baseline

**F:** Expo SDK 58, React Native 0.88, React 19.3, Router, safe areas, tema e TypeScript estrito; template sem autenticação, cliente de dados ou testes configurados nos scripts. `main` é a referência principal local; não há `origin/HEAD` simbólico para confirmar a default remota sem consulta.

Evidências: [dependências](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/package.json:1), [layout](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/src/app/_layout.tsx:1), [configuração](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/app.json:1), [instruções](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/AGENTS.md:1).

**F — Baseline reconfirmado nesta revisão:** typecheck falhou em duas importações CSS e ref do template web. `npm run lint` não executou análise por falta de configuração; sua oferta de instalação foi recusada. No planejamento anterior a tentativa automática havia sido interrompida e a alteração desfeita. Nenhuma correção ou instalação foi feita nesta revisão.

Evidências: [CSS module](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/src/components/animated-icon.web.tsx:5), [ref](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/src/components/app-tabs.web.tsx:38), [CSS global](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/src/constants/theme.ts:6).

## 4. Responsabilidades e incertezas

Preservar semântica dos contratos, IDs opacos, hierarquia pessoa/conta/contexto/condomínio e ações por feature. Nest continua responsável por autorização do recurso, vínculos, bloqueio de conta, transições de ocorrência, recorrência/conclusão de tarefas, autoria, efeitos de notificação, arquivos e validações definitivas.

Mobile responde por navegação, apresentação, validação de conveniência, sessão local, cache e recuperação de rede. Nenhum componente/cache poderá conceder uma permissão não comprovada pelo backend.

**Ainda exige evidência:** revisão implantada/schema, envelope de erros, perfis e política de acesso ao app, volumetria/latência, concorrência de sessões, limites/retenção de arquivos e infraestrutura externa de notificações. Não foram preenchidos por suposição.
