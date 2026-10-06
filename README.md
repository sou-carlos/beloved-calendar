# Beloved · Aniversários e presentes

Calendário de aniversários pensado primeiro para celular. Interface em português inspirada nos menus de Stardew Valley: madeira, pergaminho, cores fortes, fontes locais e ícones pixel art originais em SVG.

## Executar

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run test -- --run`

## Funcionalidades

- Calendário mensal, destaque de hoje e seleção de dias com múltiplos aniversários.
- Próximos aniversários ordenados e contagem de dias.
- Cadastro, edição, busca e exclusão confirmada de amigos.
- Perfis com símbolo, gostos, coisas que não gostam e anotações.
- Ideias de presentes com link, detalhes e controle de compra.
- Visão geral de presentes pendentes e comprados.
- Exportação dos cadastros em JSON para guardar uma cópia.
- Persistência em IndexedDB e cache offline via service worker na versão de produção.
- Cartas de aniversário em pixel art: no perfil de um amigo, personalize mensagem e remetente, veja a prévia e baixe um PNG com nome e aniversário sem o ano. Também funciona como visitante, sem enviar o conteúdo da carta ao servidor.
- Sincronização por conta com fila offline, importação opcional de visitante e resolução de conflitos.

## Dados e datas

Os registros existentes em `beloved-calendar-db` são preservados como dados de visitante. Cada conta tem seu próprio IndexedDB (`beloved-account-<id>`) e cópia sincronizada no PostgreSQL. Ao entrar, a importação do visitante é opcional e mantém os originais. Ao sair, a aplicação volta ao calendário de visitante; as alterações pendentes ficam guardadas na conta original. Limpar dados do navegador apaga dados locais ainda não enviados. A exportação é uma cópia em JSON; restauração pela interface ainda não está implementada.

Cada amigo, com seus presentes, é uma unidade versionada. Alterações são salvas localmente antes do envio. Operações têm IDs duráveis para repetição sem duplicação; exclusões deixam marcadores para propagação. Conflitos preservam a versão local e a da conta: escolha uma, ou mantenha a da conta e crie uma cópia da local. Edições em amigos diferentes não conflitam.

A sincronização ocorre após login ou restauração inicial de sessão válida, ao alterar dados e pelo botão “Sincronizar agora”. Não há consultas periódicas, ao voltar à janela ou ao recuperar conexão. Alterações offline aguardam um desses gatilhos. O painel mostra envios pendentes, erros e conflitos, com botão manual. Ainda não há sincronização com o app fechado. O perfil não secreto da última conta é lembrado para selecionar seu cache offline; isso não autentica requisições. Em dispositivos compartilhados, saia da conta antes de entregar o navegador.

## Backend e autenticação

O backend Java está em `../beloved-calendar-backend`. Nessa pasta execute `docker compose up --build -d`; o `.env` local inicial já contém uma senha gerada. Em outra instalação, copie `.env.example` para `.env` e configure `DB_PASSWORD`.

A API atende em `http://localhost:8081` e o PostgreSQL em `localhost:5433`. `npm run dev` e `npm run preview` encaminham `/api` para a API. O frontend usa cookies HttpOnly e token CSRF, sem gravar senhas ou tokens no localStorage. Falhas de conexão não impedem o uso do calendário.

Na Vercel, `vercel.json` encaminha `/api` para `https://beloved-calendar-backend-production.up.railway.app`, antes do fallback da SPA. Mantenha `VITE_API_URL` vazio para usar esse proxy com cookies na mesma origem. No Railway, use `COOKIE_SECURE=true` e `APP_ALLOWED_ORIGINS` com a origem HTTPS exata do frontend. Ao mudar o domínio do frontend, atualize essa lista; ao mudar o backend, atualize o destino em `vercel.json`. As respostas da API não devem ser armazenadas em cache.

O ano informado não afeta a recorrência. Caso não saiba o ano, use 2000. Aniversários de 29 de fevereiro aparecem em 28 de fevereiro nos anos não bissextos. A contagem usa dias civis para evitar diferenças de fuso e horário de verão.

## Estrutura

- `src/App.tsx`: navegação, estado persistido e telas principais.
- `src/components/BirthdayCalendar.tsx`: calendário e seleção de datas.
- `src/components/FriendForm.tsx`: cadastro e edição.
- `src/components/FriendDetail.tsx`: preferências e presentes.
- `src/components/Modal.tsx`: diálogo nativo, foco e fechamento por Escape.
- `src/lib/db.ts`: banco local compatível com a versão original.
- `src/lib/dates.ts`: regras de recorrência, testadas com Vitest.
- `src/lib/sync.ts`: bancos por conta, fila durável, importação e resolução de conflitos.
- `src/components/CalendarProvider.tsx`: estado do calendário e agendamento da sincronização.
- `src/components/SyncPanel.tsx`: status, importação e comparação das versões em conflito.
- `src/style.css`: identidade visual e layout responsivo.

A aplicação não envia notificações. As fontes são hospedadas com a aplicação e ficam disponíveis offline.

## Validação da interface

Execute `npx playwright install chromium` uma vez. Depois use `npm run build` e `npm run test:e2e` para testar a versão de produção em celular e desktop, incluindo uso offline, cadastro, edição, presentes, exclusão e preservação dos dados antigos. As capturas ficam em `test-results/`.

Os testes de `e2e/account.spec.ts` exigem o backend disponível em 8081 e criam contas de teste com emails únicos `beloved-e2e-...@example.com` no banco local. Verificam cadastro, login, logout, restauração de sessão e indisponibilidade da API. Use um banco descartável para testes automatizados. Os testes Java usam seu próprio PostgreSQL temporário.

`e2e/sync.spec.ts` também usa a API real e contas `sync-...@example.com`, exercitando importação, isolamento, edição offline, múltiplos navegadores, conflitos e exclusões. A API usa snapshots completos por conta nesta primeira versão; registros e recibos não têm expiração automática.
