# Arquitetura do incremento implementado

Atualizado em 21/10/2026. A base da `cursor-login` foi incorporada à `codex-login` e revisada. As decisões e alterações de backend foram autorizadas nesta conversa; o plano original em `docs/arquitetura` é histórico, não um relatório de testes concluídos.

- **Organização:** rotas finas em `src/app`; autenticação/dashboard em `src/features`; transporte/configuração/cache em `src/lib`; UI/tema em componentes compartilhados. Testes ficam fora de `src/app`.
- **Estado remoto:** TanStack Query v5; identidade tem uma fonte única no cache. O Context da sessão expõe status, ações e leitura dessa identidade, sem manter outra cópia de perfil. Não há cache remoto persistente ou fila offline.
- **Contratos:** GraphQL Code Generator client preset com documentos string tipados, scalars estritos e verificação de drift. Schema versionado com procedência. O runtime não depende de parser GraphQL.
- **Sessão:** operações mobile aditivas no Nest. SecureStore guarda refresh/metadados de ambiente em um único item; access token só em memória. Preview web usa memória e não representa persistência nativa.
- **Restauração:** sempre confirmar refresh e identidade no servidor antes de montar a área autenticada. Falhas temporárias exibem recuperação; não se permite dashboard offline a partir de perfil salvo não validado.
- **Concorrência:** uma renovação por vez, geração da sessão verificada em respostas tardias e escritas de armazenamento serializadas. Logout bloqueia acesso, cancela consultas e limpa o cache, inclusive quando a rede falha. Erro de exclusão impede falsa confirmação de limpeza.
- **Transporte:** bearer atual em memória; HTTP, GraphQL e erros de formato são distintos. Dados parciais de autenticação não são aceitos. Renovação não repete mutations; erros 403 de feature não são tratados como logout global. Mensagens internas do backend não são exibidas.
- **Ciclo de vida:** Query online/focus managers ligados ao estado inicial e eventos de rede/AppState, com cleanup. Tokens próximos da expiração são renovados, inclusive ao voltar ao app.
- **Navegação:** Expo Router e Stack.Protected; falha de restauração mostra recuperação em vez de prender indefinidamente no splash. Deep link sem sessão confirmado vai ao login.
- **Experiência:** marca/Maven Pro, temas claro/escuro, safe areas, teclado e inputs acessíveis. Cor de ação ajustada para contraste. Login usa RHF/Zod; senha não muda na validação e é limpa após sucesso.
- **Escopo:** dashboard somente de identidade; foram retiradas consultas de condomínios e allowlist de perfis não autorizada por produto. Autenticação de conta ativa não concede permissões operacionais.

O backend novo não altera `PersonAccount.refreshToken` nem as operações legadas. Contas mobile têm sessão própria com expiração absoluta de 30 dias, access de até 15 minutos, refresh com hash e rotação por compare-and-swap. Replay revoga só a sessão comprometida. O bearer mobile valida a sessão ativa, bloqueio/exclusão da conta e validade do token. Essas regras não reescrevem retroativamente o comportamento dos tokens legados.

Limitações de implantação e aceite: [backend-limitations.md](backend-limitations.md) e [validacao-login.md](validacao-login.md).
