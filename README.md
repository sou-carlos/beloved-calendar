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

## Dados e datas

Os registros existentes em `beloved-calendar-db` são preservados. Os novos campos são opcionais. Os dados ficam neste navegador/dispositivo: não há conta ou sincronização em nuvem. Limpar os dados do navegador pode apagar os cadastros. A exportação é uma cópia em JSON; restauração pela interface ainda não está implementada.

O ano informado não afeta a recorrência. Caso não saiba o ano, use 2000. Aniversários de 29 de fevereiro aparecem em 28 de fevereiro nos anos não bissextos. A contagem usa dias civis para evitar diferenças de fuso e horário de verão.

## Estrutura

- `src/App.tsx`: navegação, estado persistido e telas principais.
- `src/components/BirthdayCalendar.tsx`: calendário e seleção de datas.
- `src/components/FriendForm.tsx`: cadastro e edição.
- `src/components/FriendDetail.tsx`: preferências e presentes.
- `src/components/Modal.tsx`: diálogo nativo, foco e fechamento por Escape.
- `src/lib/db.ts`: banco local compatível com a versão original.
- `src/lib/dates.ts`: regras de recorrência, testadas com Vitest.
- `src/style.css`: identidade visual e layout responsivo.

A aplicação não envia notificações. As fontes são hospedadas com a aplicação e ficam disponíveis offline.

## Validação da interface

Execute `npx playwright install chromium` uma vez. Depois use `npm run build` e `npm run test:e2e` para testar a versão de produção em celular e desktop, incluindo uso offline, cadastro, edição, presentes, exclusão e preservação dos dados antigos. As capturas ficam em `test-results/`.
