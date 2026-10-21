# Primeiro incremento — execução, riscos e aceite

Status: plano para aprovação. Não implementado. Complementa o [diagnóstico](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/docs/arquitetura/diagnostico.md) e a [arquitetura proposta](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/docs/arquitetura/proposta-mobile.md).

## 1. Resultado esperado e limites

Conta existente → login com e-mail/senha → autenticação real no Nest → credencial segura → dashboard inicial com identidade → logout. Ao reabrir, restaurar a sessão com verificação no servidor, sem tela autenticada aparecendo antes dessa confirmação.

Inclui Android e iOS, sessão/expiração/renovação conforme contrato aprovado, erros de rede/contrato/armazenamento, proteção de rotas e limpeza na troca de pessoa. Dashboard contém apenas identificação e saída; nenhuma métrica fictícia ou consulta de módulo operacional.

Não inclui cadastro, recuperação de senha nativa, biometria, login social, tarefas, ocorrências, seleção de condomínio, push, uploads, sincronização offline ou publicação nas lojas. A arquitetura dessas expansões foi considerada, mas seus componentes não serão criados antecipadamente.

## 2. Condições para execução

| Condição | O que libera | Estado atual |
| --- | --- | --- |
| G0 — Aprovação deste planejamento e do escopo mobile | Implementação da base, testes e interface no mobile | Pendente; esta execução termina no planejamento. |
| G1 — Política de perfis e identidade do dashboard | Regras de entrada e casos de perfil não atendido | Pendente de produto; não inventar allowlist. |
| G2 — Contrato de sessões compatível, disponível em homologação | Integração final de login/refresh/logout com coexistência | O código lido não atende; exige trabalho separado aprovado no server ou evidência de contrato já implantado. |
| G3 — Schema/erros/versão do ambiente e contas de teste confirmados | Codegen definitivo e testes de contrato reais | Pendente; nenhuma credencial de produção foi solicitada ou utilizada. |
| G4 — Ambiente Android/iOS e distribuição de teste definidos | Aceite nativo e validação pelo Rogério | Será preparado na implementação; EAS é opção, não execução já autorizada. |

G0 permite preparar base independente; G2/G3 precedem operações definitivas do novo fluxo. Simulação de rede/armazenamento serve a testes, não substitui autenticação real no aceite. Conta dedicada com contrato legado serve a investigação isolada, mas não comprova integridade da mesma conta no web/mobile.

Não é necessário corrigir todos os módulos legados antes de iniciar. São dependências desta entrega: sessão compatível, identidade segura e erros suficientes para recuperação correta. Paginação de ocorrências, otimização N+1, uploads e push são riscos para incrementos futuros, sem bloquear a preparação da base de login.

## 3. Contrato confirmado e contrato pendente

| Operação existente no Nest | Input/resultado mínimo confirmado | Limite para este projeto |
| --- | --- | --- |
| `createSession` | `data: CreateAuthInput` com `email`, `password`; `person { id name email status }`, `token`, `refreshToken` | Substitui refresh da conta mesmo se o cliente não selecionar o campo. |
| `getPersonInfoByToken` | `data: GetPersonInfoByTokenInput` com `token`; `person { id name email status }` | Não reidrata contextos/permissões nem oferece revogação por dispositivo. |
| `refreshTokenClientSide` | `data: RefreshTokenClientSideInput` com `refreshToken`; `accessToken`, refresh opcional no schema | Rotação atual conflita com sessões paralelas; divergência de segredo no código. |
| `signOut` | `personId: String!`; Boolean | Limpa refresh global da conta. Não é logout exclusivo do dispositivo. |

Evidências: [resolver](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.resolver.ts:20), [schema](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/schema.gql:1955), [serviço](/Users/rogerio/Projetos/SindicoPro/sindico-pro-server/src/auth/auth.service.ts:34).

A proposta de novas operações por sessão está na arquitetura, D8. Só escrever documentos GraphQL dessas operações depois de seus nomes/inputs/outputs terem sido aprovados e existirem no schema alvo. Não declarar um adapter com endpoint fictício como integração concluída.

## 4. Etapas e arquivos previstos

Todos os caminhos desta seção são relativos ao repositório mobile e representam arquivos futuros; nenhum foi criado como implementação nesta revisão.

| Etapa | Dependência | Trabalho e arquivos previstos | Evidência de conclusão |
| --- | --- | --- | --- |
| 0. Preparar baseline | G0 | Revalidar Git/`main`/`codex-login`; documentar diferenças desde o plano. Substituir/retirar demos afetadas e resolver CSS/ref do template; configurar `eslint.config.js`, scripts e testes em `package.json`. | Lint/typecheck válidos, lockfile consistente, nenhum trabalho anterior sobrescrito. |
| 1. Infraestrutura de dados | G0 | `src/shared/api/{env,graphql-client,api-error}.ts`, `src/providers/{query-provider,query-lifecycle}.tsx/ts`; configuração de ambiente e exemplo sem segredos; QueryClient estável e ciclo de rede/foco. | Testes de envelope, cancelamento, escopo e erros; sem request real a produção. |
| 2. Congelar contrato | G2/G3 | `graphql/schema.graphql`, `graphql/schema-source.md`, `codegen.ts`, `src/features/auth/api/*.graphql`, `src/graphql/generated/*`. | Operações validadas, scalars explícitos, regeneração sem drift e smoke test em homologação. |
| 3. Controlador de sessão | Etapas 1/2 | `src/features/auth/model/{session-controller,session-types}.ts`, `src/features/auth/auth-provider.tsx`, `src/shared/storage/session-storage.ts` com implementação nativa e fallback `.web.ts`, `src/features/auth/api/auth-api.ts`, schemas de resposta/credencial. | Login/restore/refresh/logout testados, inclusive falhas de armazenamento, rede e respostas tardias. |
| 4. Fluxo e marca | G1 e etapa 3 | Layout/entrada/rotas em `src/app`, telas em `features/auth/screens` e `features/dashboard/screens`, componentes em `shared/ui`, tokens em `shared/theme`, ativos e configuração Expo necessários. | Login acessível → dashboard com pessoa correta → saída; guards e deep link testados. |
| 5. Integração nativa e regressão | G2/G3/G4, etapas anteriores | `tests/integration`, fixtures sanitizadas, `.maestro/`, scripts de validação/CI em workflow mobile; README de configuração/testes. | Matriz abaixo executada, relatório de Android/iOS e coexistência com web. |
| 6. Entrega para validação | Checks e matriz sem bloqueio | Instruções para reproduzir, revisão alvo do backend/app, limitações conhecidas e resultado de testes. | Rogério testa; commit/push/PR/merge só por autorização posterior explícita. |

Manter commits pequenos é recomendação para quando houver autorização, não permissão para realizá-los agora. Caso a branch tenha mudado ou contenha trabalho de outra origem, reavaliar antes de editar. Não criar outra branch por cima ou mover alterações sem necessidade.

O schema e as credenciais não podem vir de `.env` copiado do web/server. `EXPO_PUBLIC_GRAPHQL_URL` e URL REST são configurações públicas; chaves JWT/S3/banco e senhas não entram no bundle. Ignorar `.env.local` e segredos de teste; publicar apenas `.env.example` com valores ilustrativos. Separar identificadores/ambiente de builds de teste e produção quando a distribuição for configurada.

## 5. Requisitos da interface

- E-mail válido, senha obrigatória; remover espaços externos do e-mail, sem mudar caixa ou senha sem contrato explícito. Não impor nova política de tamanho de senha a contas existentes.
- Rótulos visíveis, teclado e autofill nativos, mostrar/ocultar senha acessível, foco no erro e botão Entrar com carregamento/bloqueio de duplicidade.
- Estados separados: inicial, validação, processamento, erro de credenciais, indisponibilidade/timeout, sessão em restauração, recuperação e armazenamento indisponível.
- Splash limitado pela inicialização; após timeout, tela recuperável com Tentar novamente e saída local, sem expor dashboard indevidamente.
- Dashboard com dados reais mínimos da pessoa, ação Sair e layout em claro/escuro. Não expor documento/telefone ou dados de terceiros sem necessidade.
- Fonte ampliada, safe areas, contraste, VoiceOver/TalkBack e teclado em telas pequenas. Mensagens não podem depender só da cor.

## 6. Estratégia de teste

**Unidade (U):** Jest/`jest-expo`, relógio controlado, cliente HTTP e armazenamento substituídos na borda; testar parsing, transições, concorrência, serialização de credencial e erros. Não snapshotar estruturas inteiras de UI.

**Integração mobile (I):** providers, controlador e Router reais em teste, com rede/SecureStore simulados. `expo-router/testing-library` e React Native Testing Library 14+ conforme guia SDK 58. Verificar o que o usuário pode acessar e efeitos em cache/credenciais, não apenas a rota atual.

**Contrato (C):** validação Codegen contra schema versionado mais chamadas das operações reais em homologação com conta própria de teste. Cobrir envelopes de erro sanitizados, campos ausentes, conta bloqueada/excluída e autorização. Não executar testes do Nest que migram/limpam banco nesta tarefa mobile.

**E2E (E):** Maestro com binário de teste Android e iOS, automatizando login/logout e reabertura para restauração. Usar conta/segredos de teste fornecidos ao runner, sem versionar valores nem colocar senhas em nomes de arquivos/screenshots. O resultado do runner e a revisão do binário são evidências; screenshots não comprovam sessão persistida.

**Manual (M):** dispositivos físicos, biometria/Keychain não envolvidos no login, leitores de tela, fonte/teclado, background/foreground, queda de rede e coexistência real web/mobile. São verificações complementares; aprovação visual não substitui testes de sessão.

Referências: [Jest Expo](https://docs.expo.dev/develop/unit-testing/), [testes Router SDK 58](https://docs.expo.dev/router/reference/testing/), [E2E com Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests/).

## 7. Critérios objetivos de aceite

Todos são critérios futuros, não resultados já obtidos. A entrega só é completa depois de executar e registrar os testes aplicáveis em Android/iOS e homologação.

| ID | Cenário | Resultado obrigatório | Como comprovar |
| --- | --- | --- | --- |
| T01 | Instalação/primeira abertura sem credencial | Login; nenhuma informação autenticada antes da validação. | I + E Android/iOS. |
| T02 | E-mail inválido/senha vazia | Erro no campo, nenhuma requisição. Senha não é alterada pela validação. | U + I. |
| T03 | Credenciais válidas | Uma sessão real; dashboard com ID/nome/e-mail da pessoa esperada; senha descartada e somente credencial mínima persistida. | C + I + E. |
| T04 | Senha incorreta/conta inexistente/inativa | Sem sessão/cache de identidade nem dashboard; mensagem segura conforme erro confirmado. Sem enumeração de conta. | C + I; fixtures U. |
| T05 | Toques duplicados e request lento | Uma submissão ativa, loading acessível e saída de timeout em até o prazo configurado, sem loop. | I; M rede lenta. |
| T06 | HTTP 200 com `errors`, `data: null`, JSON inválido, campos críticos ausentes ou formato alterado | Falha classificada; sem sessão parcial e sem lista vazia usada para esconder erro. | U + I; C para envelopes reais. |
| T07 | Encerrar processo/reabrir app nativo | Refresh por sessão, credencial rotacionada persistida e identidade confirmada antes do dashboard. | I + E Android/iOS; M em aparelho. |
| T08 | Bootstrap/refresh offline ou API fora do ar | Credencial preservada, área protegida bloqueada quando ainda não validada, recuperação disponível; rede não vira credencial inválida. | U + I; M modo avião/timeout. |
| T09 | Access expirado e refresh válido | Uma única renovação para chamadas simultâneas; nova credencial usada. Sem reenvio cego de mutation. | U + I; C com validade curta no ambiente de teste. |
| T10 | Refresh expirado/revogado/reutilizado | Login solicitado, estado anterior removido, sem repetição infinita; tratamento da família conforme contrato. | U + I + C. |
| T11 | Refresh aplicado no servidor, resposta perdida | Recuperação idempotente prevista em contrato ou reautenticação segura; sem cadeia de retries que invalide outra sessão. | I + C com falha de transporte controlada. |
| T12 | Falha de leitura/escrita/exclusão SecureStore | Erro explícito e UI bloqueada/recuperável; nunca falso sucesso de persistência/limpeza. | U + I; M para cenários nativos reproduzíveis. |
| T13 | Logout online | Credencial local/cache eliminados; sessão atual revogada no Nest; voltar/deep link não acessa dashboard; web e outro dispositivo continuam válidos. | I + C + E; M de coexistência. |
| T14 | Logout offline | Saída local e limpeza confirmadas; informar ausência de confirmação de revogação remota. Nova abertura não restaura a credencial removida. | I + M Android/iOS. |
| T15 | Login/refresh responde após logout/troca de conta | Geração antiga não escreve credencial nem repopula cache/UI. | U + I com promises controladas. |
| T16 | Conta A → sair → conta B | Sem dados, páginas, permissões ou placeholders de A. | I + E; C com duas contas. |
| T17 | Link direto/protegido e destino inválido | Exige sessão/acesso; sem open redirect ou token na URL; histórico protegido removido na saída. | I + E + M links nativos. |
| T18 | Conta/escopo não atendido ou permissão revogada | Fluxo definido por produto; desconhecido não libera módulo. 403 de feature não encerra automaticamente a sessão inteira. | I + C; depende de G1/G2. |
| T19 | Web + dois dispositivos mobile, mesma conta | Login/renovação/logout de um mobile não substitui credenciais nem revoga sessões dos demais ou do web. | C + M, matriz específica abaixo. |
| T20 | Teclado, fonte ampliada, tema e leitores de tela | Todos os campos/ações alcançáveis, erros anunciados e contraste válido nos dois sistemas. | I para labels/estados; M VoiceOver/TalkBack e aparelhos. |
| T21 | Regressão de base/contrato | Lint, TypeScript, testes e geração sem drift; nenhum segredo em artefatos; dependências compatíveis com SDK 58. | CI local/mobile; revisão de diff. |

Expiração deve ser testada com relógio simulado em U/I e TTL/fixtures controlados em homologação. Não esperar 30 dias nem colocar segredo de assinatura no app para fabricar um token. Adulterar assinatura testa token inválido, não expiração real.

### Matriz de coexistência (T19)

Estabelecer baseline do web antes do teste, com tokens tratados como segredo e evidências sem seus valores. Na mesma conta de teste:

1. Login web → login mobile A → login mobile B; verificar web e ambos os apps.
2. Renovar A e B repetidamente, incluindo concorrência; verificar que a credencial legada do web não foi sobrescrita. Exercitar a operação legada de renovação em teste de contrato, mesmo que o Next atual não a invoque automaticamente.
3. Sair de A; confirmar B e web ativos. Novo login web não deve revogar B.
4. Revogar somente B; confirmar falha de B e continuidade do web. Confirmar rejeição do access token de B conforme política de revogação aprovada.
5. Repetir com ordem de logins invertida e encerrar/reabrir o processo dos apps.

A divergência de segredo do refresh legado pode produzir falha já no baseline. Registrar e separar regressão de defeito preexistente; não alegar que o mobile resolveu renovação do web. O aceite requer evidência de ausência de nova interferência e solução aprovada para os requisitos de sessão mobile. Se o contrato continuar usando o campo único, T19 não passa.

## 8. Registro de riscos e tratamento

| Risco | Evidência | Impacto | Tratamento/momento |
| --- | --- | --- | --- |
| R1 — Refresh único por conta | Diagnóstico A1/A2/A4 | Mobile compromete renovação web/outro dispositivo | Bloqueia aceite de coexistência. Sessões aditivas por dispositivo, trabalho separado no backend. |
| R2 — Assinatura/rotação inconsistentes | A3 | Renovação falha; clientes podem invalidar credenciais de outros | Não reutilizar o fluxo cegamente; testar refresh novo repetido e compatibilidade legada. |
| R3 — Revogação/status incompletos | A5/A6 | Logout global de refresh não encerra access; conta excluída pode ser tratada de forma inconsistente | Novo contrato/validação de sessão e identidade são dependência do fluxo final. |
| R4 — Autorização por recurso desigual | Seção de permissões no diagnóstico | Exposição entre condomínios ou ações indevidas | Revisão direcionada dos endpoints usados; auditar módulos antes de sua liberação. Não solucionar só com guards mobile. |
| R5 — Schema local diferente do implantado | Alterações/commits de tarefas observados | App pede campos não disponíveis | Snapshot com procedência e testes no ambiente alvo. |
| R6 — Envelope de erro ambíguo | A6 e wrappers web | Logout indevido, sucesso parcial ou mensagem interna | Parsing/erros centralizados e fixtures reais sanitizadas. |
| R7 — Cache entre identidades/escopos | UI web copia coleções; aplicativo terá múltiplos contextos | Dados antigos visíveis para outra pessoa | Chaves completas, cliente estável por sessão, cancelamento e geração de sessão. |
| R8 — Listas amplas/N+1/paginação desigual | Ocorrências/tarefas no diagnóstico | Memória, latência e bateria elevadas | Antes desses módulos: medir, limitar projeções e aprovar paginação server. Não bloqueia dashboard de identidade. |
| R9 — Uploads/segredo VAPID | Seção de arquivos/notificações | Reuso indevido de infraestrutura ou material privado | Não copiar; revisar em trabalho autorizado antes das respectivas features. Sem valores privados nos docs. |
| R10 — Compatibilidade/baseline SDK 58 | Template e checks locais | Implementação começa sem checks confiáveis | Resolver base, validar peer dependencies e binário real; sem downgrade/upgrade amplo automático. |
| R11 — Rotação com falha de rede/armazenamento | Novo contrato proposto | Perda de credencial válida e sessão irrecuperável | Transação no servidor, política de idempotência e recuperação testadas; sem persistir senha. |

## 9. Decisões de produto pendentes

| Questão | Recomendação para discutir | Consequência |
| --- | --- | --- |
| Quais perfis entram na primeira versão: síndicos, funcionários, administradores, fornecedores? | Começar pelos perfis de síndico validados pelo backend; decidir explicitamente a experiência dos demais e de contas com múltiplos contextos. | Não gerar allowlist de seed nem deduzir acesso de `isEmployee`. |
| Qual política de duração, inatividade e revogação de sessão? | Access curto e refresh limitado por política; logout por dispositivo. | Define contrato/testes e comportamento offline; números finais ainda pendentes. |
| Qual comportamento se a mesma pessoa tiver vários contextos? | Identidade consistente e escopo autorizado explícito; seleção quando recursos exigirem. | Não escolher arbitrariamente a primeira permissão/condomínio como tenant. |
| Haverá app white label ou só Síndico Pro? | Primeiro incremento com marca padrão e tokens extensíveis, sem lógica de hostname. | White label futuro pode exigir build/distribuição próprios; fora do incremento. |
| Dashboard inicial e perfis sem `showPanel`? | Base de identidade para perfis aprovados; métricas futuras condicionadas às permissões. | Evita expor o painel operacional por ser autenticado. |
| Homologação, contas e teste em dispositivos | Mesmo backend/schema alvo e contas dedicadas com pelo menos dois perfis/pessoas, mais uma conta compartilhada entre web e dois apps no teste de coexistência. | Sem esses recursos não declarar C/E/M concluídos. |

## 10. Verificações desta revisão e definição de pronto

Executado durante o planejamento, sem instalar ou corrigir código:

- `npx --no-install tsc --noEmit`: exit 2; três erros preexistentes em CSS module, ref de `app-tabs.web.tsx` e importação `global.css`.
- `npm run lint`: exit 1; ESLint sem configuração. A oferta de instalar/configurar foi recusada para manter a execução apenas investigativa.
- Checks do Nest/web que modificam banco, arquivos ou produção não foram executados. Bibliotecas propostas e contratos futuros não foram testados como se já estivessem implementados.

Na implementação, preparar e executar os seguintes checks, com scripts efetivamente adicionados apenas após aprovação:

```text
npm run lint
npx tsc --noEmit
npm run codegen:check
npm test -- --runInBand
npx expo install --check
npx expo-doctor
```

Também exigir bundle/build nativo de teste compatível, E2E Android/iOS, testes de contrato e a validação manual registrada. Em aparelho físico, `localhost` não é o computador; configurar endereço acessível ou HTTPS de homologação. Não enfraquecer TLS para facilitar testes de produção.

Pronto significa: G1–G4 resolvidos, critérios aplicáveis aprovados, ausência de regressão web demonstrada, documentação reproduzível e limitações explícitas, com evidências ligadas às revisões testadas. Se sessão real só passar isoladamente e T19 falhar, a entrega está incompleta. O Rogério valida a branch antes de autorizar commit/push/PR/merge.
