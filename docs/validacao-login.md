# Validação do login — 21/10/2026

## Executado

- Mobile: lint e TypeScript; 47 testes automatizados em 9 suítes cobrindo formulário, navegação, restauração confirmada, expiração, rede, logout, persistência, erros de envelope/HTTP, concorrência e respostas atrasadas.
- Contrato mobile: geração tipada contra o schema novo e verificação de drift.
- Backend: 15 testes em duas suítes, com JWT real e persistência simulada; login, hash, rotação repetida/concorrente, replay, dois aparelhos, logout, conta inativa/excluída, audience/tipo de token, bearer legado e comparação do schema com decorators reais.
- Backend: build Nest e validação do schema Prisma. O typecheck global incluindo specs encontrou erro preexistente de mock em `manage-packages.spec.ts`; o build de produção e os novos testes passam.
- Bundles Hermes Android e iOS gerados por `expo export`. Isso valida bundle, não instalação/execução em aparelho.
- Preview web exportado; login e mensagens de campos vazios verificados visualmente. Nenhuma credencial foi enviada no preview.
- Compatibilidade de dependências Expo verificada; expo-doctor executado com rede passou em 20/20 checks.

## Ainda depende do ambiente de teste

1. Aplicar a migration aditiva em banco isolado, sob autorização do responsável; iniciar a branch `codex-mobile-auth` no backend de homologação/local.
2. Configurar `.env.local` do app para esse backend e entrar com uma conta de teste existente.
3. Em Android e iOS: login → dashboard com identidade correta → encerrar processo/reabrir → restauração → sair → reabrir sem sessão.
4. Na mesma conta: web + mobile A + mobile B; renovar A, sair de A, confirmar web/B; revogar B, confirmar web. Os testes simulados não comprovam a implantação real.
5. Testar rede lenta/modo avião, refresh com resposta perdida e falha/indisponibilidade do armazenamento seguro.
6. Conferir VoiceOver/TalkBack, fonte ampliada, teclado em tela pequena, claro/escuro e deep links no binário nativo.

Nenhum teste SQL, migration, seed ou deploy foi executado. Não considerar todo o aceite de dispositivos/homologação concluído apenas pelos testes automatizados ou pela prévia web.
