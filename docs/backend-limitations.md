# Backend necessário e limites de aceite

O mobile depende da branch **codex-mobile-auth** do `sindico-pro-server`. Não usa mais os endpoints legados que mantêm um único refresh por conta.

## Pré-requisito de teste

A migration `20261021150000_mobile_sessions` cria uma tabela aditiva com FK para a conta; o campo legado de refresh é preservado. O SQL foi criado e o schema Prisma validado, mas nenhuma migration, seed ou deploy foi executado. É necessário preparar um ambiente de teste com essa migration antes de fazer login real pelo app.

## Contrato novo

- `createMobileSession(data: CreateAuthInput!)`: `accessToken`, `refreshToken` e pessoa básica.
- `refreshMobileSession(data: RefreshTokenClientSideInput!)`: tokens novos da mesma sessão.
- `mobileMe`: identidade derivada do bearer, com validação da sessão/conta ativa.
- `revokeMobileSession(refreshToken: String!)`: revoga somente a sessão identificada pelo refresh assinado.

O access token mobile vale até 15 minutos; a sessão tem duração absoluta de 30 dias. Refresh é rotacionado com atualização condicional atômica; só seu hash é armazenado. Refresh expirado/revogado ou replay exige login. Reutilização assinada de refresh antigo pode revogar sua própria família, sem alterar outra sessão mobile ou a credencial web.

Não há retry automático de refresh após resultado de rede indeterminado. Se o servidor rotacionou, mas a resposta se perdeu, uma nova tentativa poderá exigir reautenticação. A UI mantém a credencial e oferece recuperação; não promete idempotência que o servidor não implementa.

Logout offline remove a credencial local; revogação remota não é confirmada e essa limitação é informada no login. Falha de SecureStore também é explícita. Instalações de teste da implementação anterior precisam entrar novamente; seus tokens e objetos de perfil não são reutilizados.

## Compatibilidade e limites

As operações e os tokens legados do site permanecem disponíveis. A estratégia bearer distingue tokens mobile antes de verificar sua sessão; não consulta a tabela nova para um bearer legado normal. Os testes de unidade cobrem a coexistência e os caminhos legados, mas não substituem regressão do site com banco real.

Não foram alteradas as regras de acesso por condomínio dos módulos existentes, o pipeline de arquivos, o Web Push nem as limitações de paginação. Antes de portar esses módulos, revisar autorização por recurso, volume e contratos. Aplicar limitação de tentativas de autenticação na infraestrutura do ambiente e verificar sua efetividade antes de exposição pública; esta entrega não acrescentou um limitador distribuído.

O app não inclui chave JWT/S3/banco. `EXPO_PUBLIC_GRAPHQL_URL` é público e deve apontar ao ambiente de teste. Nunca usar banco/conta de produção para testes destrutivos ou de replay.
