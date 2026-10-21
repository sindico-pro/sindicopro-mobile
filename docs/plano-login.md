# Síndico Pro Mobile — planejamento arquitetural

Revisão: 20/10/2026. Status: proposta para aprovação, sem implementação. Esta revisão substitui integralmente o plano anterior.

## Direção proposta

O mobile é uma nova interface do SaaS existente. A primeira entrega será **Login → autenticação real → dashboard inicial → logout**, construída sobre uma organização por funcionalidades, contratos GraphQL gerados e uma estratégia única de estado remoto.

A proposta é **Expo Router + TanStack Query v5 + GraphQL Code Generator**, com transporte HTTP tipado, Context para o ciclo da sessão e SecureStore para credenciais nativas. A escolha de TanStack Query foi comparada com Apollo; não significa que Apollo seja inadequado ao produto.

**Há uma dependência de backend para cumprir integralmente a coexistência de sessões.** `createSession` grava o refresh token em um único campo da conta, independentemente dos campos solicitados pelo cliente. Assim, login real no mobile pode substituir a credencial de renovação do web. Desativar refresh no app ou omitir `refreshToken` da seleção GraphQL não evita esse efeito. O plano anterior não resolvia esse requisito.

Recomendação: contrato aditivo de sessões mobile por dispositivo, preservando o contrato legado do web. Essa mudança precisa de aprovação específica e execução separada no server. Aprovar este planejamento não autoriza alterar backend, web ou produção.

## Entregáveis e ordem de leitura

1. [Diagnóstico dos projetos e evidências](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/docs/arquitetura/diagnostico.md): arquitetura existente, padrões preservados, limitações e fatos versus hipóteses.
2. [Arquitetura mobile e decisões](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/docs/arquitetura/proposta-mobile.md): diretórios, bibliotecas, estado, contratos, cache, navegação, segurança, alternativas e evolução.
3. [Implementação, riscos e aceite](/Users/rogerio/Projetos/SindicoPro/sindicopro-mobile/docs/arquitetura/incremento-login.md): etapas, dependências, arquivos previstos, testes e decisões de produto pendentes.

## Revisão das escolhas anteriores

| Tema | Proposta revisada |
| --- | --- |
| Escala | Base para múltiplos domínios, usando ocorrências e tarefas como referência. |
| Estado remoto | TanStack Query desde a base; cache/invalidação explícitos, sem copiar coleções para Context. |
| GraphQL | Tipos gerados por operação a partir de schema versionado. |
| Sessões | Coexistência web/mobile e revogação por dispositivo são requisitos; integração final depende de contrato compatível. |
| Conclusão | Exige testes de sessão, contrato e dispositivos, além da navegação. |

## Estado do Git e limites

- Mobile: `codex-login` já existente, baseada em `main`, HEAD `1139ffa`. No início desta revisão havia apenas `docs/` não rastreado, do planejamento anterior. Branch reutilizada, sem reset ou stash.
- Referências: server em `main`, HEAD observado ao final `6ca53e4`; web em `main`, HEAD observado ao final `f5969612`. Ambos tinham alterações de prazo de tarefas no início e estavam limpos em leitura posterior, com novos commits observados. Na última checagem apareceu `.elasticbeanstalk/` não rastreado no server; não foi aberto nem alterado. Esses movimentos ocorreram fora desta tarefa; não executei comandos de escrita nesses repositórios.
- Os fatos descrevem código local. Não foi confirmado qual revisão está implantada. Os contratos precisam ser confrontados com homologação.
- Nesta revisão: somente documentação no mobile; nenhuma instalação, implementação, migração, seed, chamada a produção, commit, push, PR ou merge.

## Decisões para iniciar

1. Aprovar arquitetura e escopo do incremento mobile.
2. Resolver o contrato de sessões: autorizar trabalho separado no backend ou indicar contrato já implantado que atenda à coexistência. O código local atual não permite garantir esse requisito só pelo mobile.
3. Confirmar perfis atendidos no lançamento, homologação e contas de teste, incluindo a mesma conta em web e dois dispositivos.

Após aprovação, a base mobile pode avançar enquanto se resolve a dependência, mas testes isolados com o contrato legado não serão apresentados como aceite completo. Nesta execução não haverá implementação.
