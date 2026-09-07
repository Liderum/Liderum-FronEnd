# Migração de Tema Escuro — Liderum Frontend

Log de coordenação entre agentes trabalhando em paralelo na Fase 0/2 da migração de
tema (extração de hex literais para CSS custom properties). Cada agente deve:

1. Ler este arquivo inteiro ANTES de começar, para ver o que os outros já fizeram/estão fazendo.
2. Adicionar uma entrada em "## Status" com STARTED + lista exata de arquivos assumidos, ANTES de editar qualquer coisa.
3. Ao terminar, editar a MESMA entrada para DONE, resumindo o que mudou.
4. Nunca editar um arquivo que outro agente já marcou como assumido por outro grupo.

## Contrato de tokens (já definidos em `src/index.css`, não recriar)

Os tokens abaixo já existem globalmente (`:root` = claro, `.dark` = escuro, ativado via
classe `dark` na tag `<html>`, controlada por `ThemeContext`/`useTheme()`). A tarefa é
trocar hex literais espalhados pelo código por `var(--token, <hex-original-exato>)` —
o fallback preserva o hex original então o tema claro fica **byte-idêntico** ao atual.

| Token           | Claro (hex atual no código) | Escuro    | Uso                                  |
|-----------------|------------------------------|-----------|----------------------------------------|
| `--paper`       | `#f7f4ef`                    | `#17150f` | fundo de página / hero escuro          |
| `--paper2`      | `#ece7da`                    | `#1e1c15` | fundo secundário / faixas              |
| `--sidebar-bg`  | `#ffffff`                    | `#1b1912` | fundo da sidebar                       |
| `--card-bg`     | `#ffffff`                    | `#1e1c15` | fundo de cards/painéis/header          |
| `--cream`       | `#f7f4ef`                    | `#1e1c15` | fundo hover claro (ex.: `--cream` já usado em vários lugares) |
| `--ink`         | `#1a1814`                    | `#f1ece0` | texto principal                        |
| `--ink2`        | `#3d3a34`                    | `#d6cfbe` | texto secundário                       |
| `--ink3`        | `#7a7670`                    | `#948e7c` | texto terciário / labels                |
| `--bdr`         | `rgba(26,24,20,0.10)`        | `rgba(241,236,224,0.10)` | borda padrão            |
| `--bdr-strong`  | `rgba(26,24,20,0.22)`        | `rgba(241,236,224,0.22)` | borda enfatizada         |
| `--gold`        | `#b8922a`                    | `#d3ab48` | cor de destaque (accent)               |
| `--gold2`       | `#d4a843`                    | `#e4c169` | cor de destaque secundária/hover       |
| `--shadow`      | (ver index.css)              | (ver index.css) | box-shadow padrão de card         |

**Regras importantes:**
- Só migrar cores **estruturais** (as da tabela acima). NÃO tocar em cores **semânticas/status**
  (vermelho de erro/atraso, verde de sucesso/concluído, laranja de alerta, cores de série de
  gráfico como `#C0392B`, `#1E8449`, `#B7770D`, etc.) — essas ficam como estão nesta fase.
- Padrão de substituição: `'#1A1814'` vira `'var(--ink, #1A1814)'` (mantém o hex original
  exatamente como fallback — não normalizar maiúsculas/minúsculas do hex original).
- Não inventar tokens novos. Se achar uma cor estrutural que não bate com nenhuma da tabela
  (variação próxima de cinza/creme, por exemplo), listar no log em vez de adivinhar.
- Não alterar nomes de classes, props ou lógica — só o valor da cor dentro de `style={{...}}`
  e dentro das template strings de CSS-in-JS (`const CSS = \`...\``).
- Rodar `npm run build` (ou `npx tsc --noEmit`) ao final do seu grupo para garantir que não
  quebrou nada, e reportar o resultado no log.

## Fase 2 — Correção de contraste "cor estourando" (pós-QA do usuário)

Depois da Fase 0/1 (migração de tokens), o usuário testou e achou dois problemas reais,
ambos com a MESMA causa raiz:

**Causa raiz:** vários componentes usam `var(--ink)` ou `var(--gold)`/`var(--gold2)`
como o PRÓPRIO fundo de um elemento decorativo/CTA (selo de logo, botão "Nova X",
botão sólido escuro, hero de página), com um texto/ícone de cor FIXA (branco) por
cima. Como `--ink`/`--gold` trocam de valor entre tema claro e escuro, esses elementos
quebram no escuro:
- `--ink` no claro é quase preto (bom fundo p/ texto branco); no escuro vira quase
  branco (`#f1ece0`) → texto branco em cima fica ilegível / o elemento "some" no fundo
  escuro da página. Foi o caso do selo do logo na Sidebar (parecia um "ícone perdido").
- `--gold`/`--gold2` no escuro são tons mais claros/vibrantes (pensados pra servir de
  destaque de TEXTO sobre fundo escuro); usados como fundo sólido de um botão com
  texto branco fixo, o contraste também cai bastante ("cor estourando").

**Correção padronizada:** adicionei em `src/index.css` (dentro do `:root`, NUNCA
redeclarados em `.dark`) três tokens de marca CONSTANTES que não trocam com o tema:
`--brand-dark: #1a1814`, `--brand-gold: #b8922a`, `--brand-gold2: #d4a843`.

Regra para os agentes desta fase: qualquer regra CSS onde o fundo do PRÓPRIO elemento
usa `var(--ink...)`, `var(--gold...)` ou `var(--gold2...)` E o texto/ícone daquele
mesmo elemento é uma cor fixa (branco/`#fff`) — trocar o token do FUNDO para o
equivalente `--brand-*` (nunca mexer no texto fixo, nunca inventar tokens novos).
Isso faz esses elementos ficarem visualmente idênticos nos dois temas (o que é
correto — são elementos de marca, não "superfície de página" que deve escurecer).

NÃO mexer em `var(--ink)`/`var(--gold)` usados como COR DE TEXTO sobre o fundo da
página (esses devem continuar trocando com o tema — é o comportamento correto).

Já corrigido pelo coordenador: `src/components/Sidebar.tsx` `.sb-logo-mark`
(`background:var(--ink)` → `background:var(--brand-dark)`).

## Status

(cada agente adiciona sua entrada abaixo, mais recente no topo)

### Agente F — Admin & Cadastros (Fase 2) — DONE

Correção de contraste "cor estourando" (fundo do próprio elemento usando
`var(--ink/--gold/--gold2)` + texto/ícone fixo branco → trocado para
`var(--brand-dark/--brand-gold/--brand-gold2)`, que não trocam com o tema):

- `src/pages/management/Companies.tsx` — `.ld-btn-dark` (botão "+ Nova Empresa"):
  `background:var(--ink)` → `var(--brand-dark)`; `.ld-btn-dark:hover` `background:var(--gold)` → `var(--brand-gold)`.
- `src/pages/management/Customers.tsx` — mesmo padrão em `.ld-btn-dark`/`.ld-btn-dark:hover`
  (botão "+ Novo Cliente").
- `src/pages/management/Suppliers.tsx` — mesmo padrão em `.ld-btn-dark`/`.ld-btn-dark:hover`
  (botão "+ Novo Fornecedor").
- `src/pages/management/RbacAdmin.tsx` — `.rbac-btn-dark`/`.rbac-btn-dark:hover` (mesmo padrão)
  e `.rbac-saving` (toast fixo "Salvando..."): `background:var(--ink)` → `var(--brand-dark)`.
- `src/pages/users/Users.tsx` — `.ld-btn-dark`/`.ld-btn-dark:hover` (mesmo padrão, botão
  "+ Novo Usuário") e `.ld-pg-btn.active` (botão de paginação ativo): `background`/`border-color:var(--ink)`
  → `var(--brand-dark)` (troquei também o `border-color`, que pareava com o background para
  deixar a borda "invisível" — se só o background mudasse, a borda ficaria com o valor
  claro do tema escuro e destoaria).
- `src/pages/settings/Settings.tsx` — `.ld-btn-dark`/`.ld-btn-dark:hover` (mesmo padrão,
  botões "Salvar" nas abas de Empresa/Perfil).
- `src/modules/incidents/pages/IncidentsPage.tsx` — `.inc-btn.primary` (botão "+ Nova Ocorrência"):
  `background:linear-gradient(...,var(--gold,#B8922A),var(--gold2,#D4A843))` → `var(--brand-gold,#B8922A)`/`var(--brand-gold2,#D4A843)`.
- `src/modules/dashboard/pages/DashboardPage.tsx` — `.db-hero` (hero do dashboard, textos
  `.db-hero-h`/`.db-hero-sub` em branco fixo por cima): `background:linear-gradient(135deg,var(--ink) 0%,#2C2820 100%)`
  → `linear-gradient(135deg,var(--brand-dark) 0%,#2C2820 100%)`; `.db-hero-btn-primary` (botão
  "Ver Obras" dentro do hero): `background:linear-gradient(135deg,var(--gold),var(--gold2))`
  → `linear-gradient(135deg,var(--brand-gold),var(--brand-gold2))`. Este era exatamente o
  ponto de risco sinalizado pelo Agente A no fim do log ("provavelmente deveria usar hex fixo
  em vez de `var(--ink)`") — resolvido com o token de marca constante em vez de hex fixo.

Não mexi em nenhum outro uso de `var(--ink)`/`var(--gold)`/`var(--gold2)` nestes arquivos —
todos os demais são cor de TEXTO sobre o fundo da página (ícones `<Icon color="var(--gold)">`,
títulos, labels) ou decorações sem texto sobre elas (ex.: barra `linear-gradient(90deg,var(--gold),var(--gold2))`
em `.ld-card::before`/`.rbac-card::before`), que devem continuar trocando com o tema.
`.ld-badge-gold`/`.rbac-module-icon`/`.ld-avatar`/`.rbac-avatar` usam `var(--gold-light)`/`var(--cream2)`
(vars locais, não globais) como fundo — fora do escopo desta correção (só `--ink`/`--gold`/`--gold2`).

`npx tsc --noEmit` — sem erros.

### Agente E — Módulos de Obra (Fase 2) — DONE

**Tarefa 1 — Centralização da página "Nova Obra":**
- `src/modules/works/pages/NewWorkPage.tsx` — `.nw` (container raiz do form) ganhou
  `width:100%;margin:0 auto;` (mantendo `max-width:720px` já existente). Em telas
  largas o formulário agora fica centralizado em vez de colado à esquerda logo após
  a sidebar.

**Tarefa 2 — Correção de contraste "cor estourando" (fundo com `var(--ink/--gold/--gold2)`
+ texto/ícone fixo branco → trocado para `--brand-dark/--brand-gold/--brand-gold2`):**
- `src/modules/works/pages/NewWorkPage.tsx` — `.nw-btn-save` (botão "Criar Obra"):
  `background:linear-gradient(135deg,var(--gold),var(--gold2))` → `linear-gradient(135deg,var(--brand-gold),var(--brand-gold2))`.
- `src/modules/works/pages/WorksListPage.tsx` — `.wl-btn-new` (botão "+ Nova Obra"):
  `background:linear-gradient(135deg,var(--gold),var(--gold2))` → `linear-gradient(135deg,var(--brand-gold),var(--brand-gold2))`.
- `src/modules/works/components/WorkLayout.tsx` — `.wk-hero` (hero da página de obra,
  texto `.wk-hero-name`/`.wk-hero-client` em branco fixo por cima):
  `background:linear-gradient(135deg,var(--ink) 0%,#2C2820 100%)` → `linear-gradient(135deg,var(--brand-dark) 0%,#2C2820 100%)`.
  (Este era exatamente o ponto sinalizado como pendência pelo Agente A no fim do log.)
- `src/modules/schedule/pages/SchedulePage.tsx` — `.sc-view-btn.active` (toggle lista/gantt ativo)
  e `.sc-btn.primary` (botão "+ Nova Tarefa"): `background:var(--gold)` → `var(--brand-gold)`
  (e `border-color` de `.sc-btn.primary` também trocado para `var(--brand-gold)`, mesmo
  elemento/mesma cor).
- `src/modules/budget/pages/BudgetPage.tsx` — `.bg-btn.primary` (botão "Revisar Orçamento"):
  `background`/`border-color:var(--gold)` → `var(--brand-gold)`.
- `src/modules/extras/pages/ExtrasPage.tsx` — `.ex-btn.primary` (botão "+ Solicitar Extra"):
  `background`/`border-color:var(--gold)` → `var(--brand-gold)`.
- `src/modules/daily-log/pages/DailyLogPage.tsx` — `.dl-btn.primary` (botão "+ Novo Registro"):
  `background:linear-gradient(135deg,var(--gold),var(--gold2))` → `linear-gradient(135deg,var(--brand-gold),var(--brand-gold2))`.
- `src/modules/works/pages/WorkOverviewPage.tsx` — nenhuma ocorrência do padrão (fundo
  `var(--ink/--gold/--gold2)` + texto fixo branco); nada alterado.

**Não alterado (decorativo, sem texto/ícone fixo por cima — fora da regra):**
`.wl-card::before`/`.nw-card::before` (faixa dourada decorativa no topo do card),
`.wk-hero-progress-fill` (barra de progresso), `.sc-stage-label::before` (dot da timeline),
`.ex-history-dot`/`.dl-entry-dot` (dots de histórico) — todos usam `var(--gold/--gold2)`
como fundo, mas são elementos puramente decorativos sem texto/ícone de cor fixa
sobreposto, então continuam trocando com o tema normalmente (comportamento correto).
Cores de TEXTO (`color:var(--ink)`/`var(--gold)`) sobre fundo de página não foram tocadas,
conforme regra.

`npx tsc --noEmit` — sem erros.

### Coordenador — Limpeza final do bug de `:root` — DONE
Agentes A e C já haviam corrigido o bug de `:root` local sobrescrevendo os tokens
globais nos arquivos deles. Fechei o restante manualmente:
- `src/pages/Login.tsx`, `Cadastro.tsx`, `ValidateCode.tsx`, `ForgotPassword.tsx`,
  `ResetPassword.tsx`, `Contact.tsx` — removido `--cream/--ink/--ink2/--ink3/--gold/
  --gold2/--bdr` do `:root` local injetado (mantidos só `--cream2` e `--gold-light`,
  que não têm equivalente global). Essas 6 páginas agora respondem ao tema global.
- `src/pages/LandingPage.tsx` — **NÃO migrado, decisão consciente**: como o Agente D
  não migrou os hex literais dessa página (fora do escopo reduzido — ~690 linhas,
  dezenas de `#fff`/`color:#fff` em botões escuros), remover o `:root` local agora
  faria a página herdar parcialmente os tokens dark (ex.: `.ldr-navcta{background:
  var(--ink)}` ficaria clara) enquanto `color:#fff` continua fixo — quebrando
  contraste. Fica para quando a LandingPage entrar na fila de migração completa
  (é a última prioridade no plano de rollout).
- `npx tsc --noEmit` rodado no projeto inteiro após todas as edições dos 4 agentes: **sem erros**.

### Agente D — Páginas Públicas/Auth — DONE
Arquivos e hex substituídos por `var(--card-bg, #fff)`:
- src/pages/Login.tsx — 2 (`.la-card` background, `.la-inp` background)
- src/pages/Cadastro.tsx — 2 (`.la-card` background, `.la-inp` background)
- src/pages/ValidateCode.tsx — 2 (`.la-card` background, `.la-otp-digit` background)
- src/pages/ResetPassword.tsx — 2 (`.la-card` background, `.la-inp` background)
- src/pages/ForgotPassword.tsx — 2 (`.la-card` background, `.la-inp` background)
- src/pages/Contact.tsx — 3 (`.la-hero` background, `.la-card` background, `.la-inp`/`.la-textarea` background)
- src/pages/LandingPage.tsx — 0 (ver observação abaixo)

`npx tsc --noEmit` — sem erros após as mudanças.

**Observação estrutural importante (não corrigida, fora do escopo desta fase):**
Todos os 6 arquivos de auth (Login/Cadastro/ValidateCode/ResetPassword/ForgotPassword/Contact)
injetam um `<style>{CSS}</style>` cujo template contém um bloco
`:root{--cream:#F7F4EF;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--bdr:rgba(26,24,20,0.1);...}`.
Como esse `:root` é injetado no `<html>` (mesmo elemento-alvo do tema global do
`ThemeContext`), ele **redefine os mesmos nomes de custom property já usados
pelos tokens globais** (`--cream`, `--ink`, `--ink2`, `--ink3`, `--gold`, `--gold2`,
`--bdr`) com valores fixos do tema claro. Como esse `<style>` é montado depois do
`index.css` no cascade, ele **sobrescreve** os tokens globais para essas páginas —
ou seja, mesmo que o `.dark` seja ativado em `<html>`, essas 6 páginas continuarão
renderizando com as cores claras fixas, porque a declaração local vence a cascata.
Não tentei corrigir isso nesta tarefa (renomear as variáveis locais contaria como
"alterar lógica/nomes", fora do escopo pedido, e um auto-referência
`var(--ink, #1A1814)` dentro do próprio `:root` que já define `--ink` gera um ciclo
inválido em CSS — arriscado sem testar visualmente). Registrando para quando o
tema escuro for de fato habilitado nessas telas: será necessário renomear essas
variáveis locais (ex. `--la-ink` em vez de `--ink`) ou remover o bloco `:root`
duplicado e trocar `var(--ink)`/`var(--gold)`/etc. no restante do CSS-in-JS pelos
tokens globais diretamente.

**Cores não migradas (deixadas como estão):**
- `#C0392B` (erro de validação) e `#FEF2F2`/`rgba(192,57,43,0.2)` (caixa de erro) —
  semânticas, fora de escopo por regra.
- `rgba(26,24,20,0.14)` (borda de inputs) e `rgba(26,24,20,0.15)` (borda de
  `.la-btn-outline`) — próximas de `--bdr` (0.10) e `--bdr-strong` (0.22) mas não
  batem exatamente com nenhum token da tabela; não inventei token novo.
- `color:#fff` em textos sobre botões escuros (`.la-btn-dark`, `.ldr-navcta`, etc.)
  — não é um token estrutural de "card/paper", é só contraste de texto sobre fundo
  escuro; não mapeado na tabela.
- `src/pages/LandingPage.tsx` — **não migrado**. É uma landing page extensa
  (~690 linhas) com dezenas de ocorrências de `#fff` (`.ldr-blueprint`,
  `.ldr-proof`, `.ldr-split`, `.ldr-fcard`, `.ldr-tcard`, `.ldr-plan`,
  `.ldr-toggle-thumb`, etc.) além do mesmo bloco `:root` duplicado descrito acima.
  Por ser página pública de menor prioridade nesta fase (conforme instrução do
  time), optei por não migrar para não gerar dezenas de edits de baixo valor sem
  verificação visual — fica pendente para quando o rollout de tema escuro
  alcançar as páginas públicas.

### Agente C — Admin & Cadastros — DONE
Arquivos e hex estruturais substituídos:
- src/pages/management/Companies.tsx — 3× `background:#fff` → `var(--card-bg, #fff)` (`.ld-card`, `.ld-btn-outline`, `.ld-btn-danger`).
- src/pages/management/Customers.tsx — 3× (mesmos 3 pontos que Companies.tsx).
- src/pages/management/Suppliers.tsx — 3× (mesmos 3 pontos que Companies.tsx).
- src/pages/management/RbacAdmin.tsx — 7× `background:#fff` → `var(--card-bg, #fff)` (`.rbac-card`, `.rbac-module-toggle`, `.rbac-perm-item`, `.rbac-perm-check`, `.rbac-btn-outline`, `.rbac-btn-danger`, `.rbac-stat`).
- src/pages/users/Users.tsx — 8× `background:#fff` → `var(--card-bg, #fff)` (`.ld-card`, `.ld-btn-outline`, `.ld-btn-danger`, `.ld-pg-btn`, `.ld-module-chip`, `.ld-module-check`, `.ld-perm-chip`, `.ld-perm-mini-check`).
- src/modules/incidents/pages/IncidentsPage.tsx — 21 substituições: 9× `background:#fff` → `var(--card-bg, #fff)` (`.inc-stat`, `.inc-toolbar`, `.inc-search`, `.inc-btn`, `.inc-card`, `.inc-empty`, `.inc-modal`, `.inc-input`, `.inc-textarea`); 1× borda `rgba(26,24,20,0.1)` em `.inc-card` → `var(--bdr, rgba(26,24,20,0.1))` (bate exatamente com `--bdr` claro); 11× `color:#7A7670` (CSS-in-JS e `style`/`color=` inline) → `var(--ink3, #7A7670)`. Este arquivo não define `:root` local (já tinha vários pontos pré-migrados como `var(--ink,#1A1814)`, `var(--cream,#F7F4EF)`, `var(--gold,#B8922A)`), então não sofria do bug abaixo.
- src/pages/settings/Settings.tsx — 3× (`.ld-card` e `.ld-btn-outline` → `var(--card-bg, #fff)`; `.ld-sidebar` → `var(--sidebar-bg, #fff)`). Campos de CEP (`.ld-cep-hint.ok/.err`, `.ld-cep-icon.loading`) e banners (`.ld-banner-warning/info`) são semânticos — não tocados, conforme instrução explícita da tarefa.

`npx tsc --noEmit` — sem erros, rodado duas vezes (antes e depois da correção de bug abaixo).

**Bug de `:root` local duplicando tokens globais — CORRIGIDO (mesmo achado do Agente D/A nos outros grupos):**
Companies.tsx, Customers.tsx, Suppliers.tsx, RbacAdmin.tsx, Users.tsx e Settings.tsx
injetavam `<style>{LDCSS}</style>` com um bloco `:root{--cream:#F7F4EF;--ink:#1A1814;--ink2:#3D3A34;--ink3:#7A7670;--gold:#B8922A;--gold2:#D4A843;--bdr:rgba(...);...}`
que redeclarava os mesmos nomes dos tokens globais de `index.css` com hex fixos do
tema claro — como o `<style>` é montado depois do `index.css`, isso sobrescrevia os
tokens globais nessas 6 páginas mesmo com `.dark` ativo em `<html>`. Segui a mesma
correção que o Agente A aplicou no grupo dele: removi do `:root` local apenas os
nomes que já são tokens globais (`--cream`, `--ink`, `--ink2`, `--ink3`, `--gold`,
`--gold2`, `--bdr`), mantendo só os genuinamente locais sem token correspondente na
tabela (`--cream2`, `--gold-light`, e em RbacAdmin.tsx também `--green`, `--green-bg`,
`--red`, `--red-bg`, que são semânticos e não conflitam com tokens globais). Isso não
altera classes/props/lógica, só a fonte de onde a cor vem — todos os `var(--ink)`,
`var(--ink3)`, `var(--gold)`, `var(--bdr)` etc. usados no restante do CSS-in-JS
dessas 6 telas agora resolvem corretamente para os tokens globais claros/escuros.

**Cores estruturais não mapeadas na tabela (deixadas como estão, sem inventar token):**
- IncidentsPage.tsx: bordas `rgba(26,24,20,0.06/0.08/0.12/0.15/0.25)` (variações
  próximas de `--bdr`/`--bdr-strong` mas nenhuma bate exatamente, exceto a de `0.1`
  em `.inc-card` que foi migrada); fundo `#fafaf8` em `.inc-card-actions` (próximo de
  `--cream` mas não idêntico); fundo `rgba(26,24,20,0.02)` em `.inc-upload-label`.
- `color:#fff` usado como texto/ícone sobre botões ou faixas de fundo escuro/colorido
  fixo (`.ld-btn-dark`, `.rbac-btn-dark`, `.rbac-saving`, `.inc-btn.primary`, ícones
  `<Check color="#fff">`/`<X color="#fff">`) — não é token estrutural de "card/paper",
  é contraste de texto/ícone fixo; trocar por `var(--card-bg, #fff)` quebraria
  contraste no dark mode (texto/ícone escuro sobre fundo escuro), então deixado como
  está.
- Cores semânticas de status (verde/vermelho/laranja/azul de badges, severidade de
  incidentes, banners de erro/sucesso/info, estados de CEP loading/success/error em
  Settings.tsx) — fora de escopo por regra explícita, não tocadas.

### Agente B — Módulos de Obra — DONE
Arquivos e hex estruturais substituídos:
- src/modules/works/pages/NewWorkPage.tsx — 4× `background:#fff` → `var(--card-bg, #fff)` (`.nw-back`, `.nw-card`, `.nw-input`, `.nw-btn-cancel`).
- src/modules/works/pages/WorksListPage.tsx — 4× `background:#fff` → `var(--card-bg, #fff)` (`.wl-search`, `.wl-filter-btn`, `.wl-view-btn`, `.wl-card`).
- src/modules/works/components/WorkLayout.tsx — 1× `background:#fff` → `var(--card-bg, #fff)` (`.wk-tabs`).
- src/modules/works/pages/WorkOverviewPage.tsx — 2× `background:#fff` → `var(--card-bg, #fff)` (`.wo-stat`, `.wo-card`) + 6× `color:'#7A7670'` → `var(--ink3, #7A7670)` (textos "Carregando…", vazios, incidente, extra, diário).
- src/modules/schedule/pages/SchedulePage.tsx — 6× `background:#fff`/`border:2px solid #fff` → `var(--card-bg, #fff)` (`.sc-summary-card`, `.sc-view-btn`, `.sc-btn`, `.sc-stage-label::before`, `.sc-task`, `.sc-modal-card`) + 2× `color:'#7A7670'` → `var(--ink3, #7A7670)`.
- src/modules/budget/pages/BudgetPage.tsx — 4× `background:#fff` → `var(--card-bg, #fff)` (`.bg-stat`, `.bg-btn`, `.bg-table-wrap`, `.bg-modal-card`) + 2× `color:'#7A7670'` → `var(--ink3, #7A7670)`.
- src/modules/extras/pages/ExtrasPage.tsx — 4× `background:#fff` → `var(--card-bg, #fff)` (`.ex-summary-card`, `.ex-btn`, `.ex-card`, `.ex-modal-card`) + 3× `color:'#7A7670'`/`background:'#fff'` inline → tokens.
- src/modules/daily-log/pages/DailyLogPage.tsx — 9× `background:#fff` (CSS-in-JS) + 2× `background: '#fff'` (inline, ícones de seção) → `var(--card-bg, #fff)`; 6× `color:#7A7670` (CSS-in-JS) + ~13× `color: '#7A7670'`/`color="#7A7670"` (inline) → `var(--ink3, #7A7670)`; 1× `color:'#1A1814'` → `var(--ink, #1A1814)`; 2× `color:'#B8922A'` (labels "Responsável:"/"Prazo:" no card de ocorrência) → `var(--gold, #B8922A)`.

Nenhum destes 8 arquivos tinha bloco `:root` local duplicando tokens globais (diferente do bug achado pelos Agentes A/C/D) — todos usam `const CSS = \`...\`` com regras diretas de classe, sem redeclarar custom properties.

`npx tsc --noEmit` — sem erros.

**Cores estruturais não mapeadas na tabela (deixadas como estão, sem inventar token):**
- NewWorkPage.tsx: `.nw-input:disabled{background:#F8F7F5;...}` — cinza claro próximo de `--paper`/`--cream` mas não bate exatamente.
- WorkLayout.tsx: `.wk-hero{background:linear-gradient(135deg,var(--ink,#1A1814) 0%,#2C2820 100%);...}` — ponta final do gradiente do hero escuro fixo, sem token correspondente; texto branco e overlays `rgba(255,255,255,x)` do hero também não mapeados (hero é sempre "escuro" por design, independente do tema).
- ExtrasPage.tsx: `.ex-card-actions{...background:#fafaf7;...}` — próximo de `--cream`/`--paper` (`#f7f4ef`) mas não idêntico.
- SchedulePage.tsx: `.sc-task-deps-label{color:#8E44AD;background:#F3E5F5;...}` — roxo, semântico (badge de dependências), não estrutural.

**Cores semânticas/status não tocadas (conforme regra):** vermelho de erro/atraso (`#C0392B`), verde de sucesso/concluído (`#1E8449`), laranja de alerta (`#E67E22`, `#B7770D`), azul informativo (`#1A5276`), e os arrays de cor por categoria/status (`catColors`, `summaryStats`, `getProgressColor`, badges de severidade/status) em BudgetPage/SchedulePage/WorksListPage/WorkOverviewPage/ExtrasPage/DailyLogPage — mesmo quando um valor individual coincidia com `--gold` (ex.: faixa 40-70% de `getProgressColor` em WorksListPage/SchedulePage), mantive por fazerem parte de uma escala semântica única de cores (verde/dourado/laranja/vermelho = saúde do indicador), não de decoração estrutural.

### Agente A — Shell & Dashboard — DONE
Arquivos e hex estruturais migrados para `var(--token, <hex>)`:
- `src/layouts/DashboardLayout.tsx` — 1 (background do wrapper raiz → `--paper`).
- `src/components/Sidebar.tsx` — 3 (`--sidebar-bg` no `.sb`, `--bdr` em 2 bordas, `--card-bg` no `.sb-action-btn`) **+ correção de bug**: o `<style>` injetado redeclarava `:root{--cream;--ink;--ink2;--ink3;--gold;--gold2;--bdr;...}` com hex fixos — isso sobrescrevia globalmente os tokens de `index.css` (inclusive em `.dark`), quebrando o tema escuro para a sidebar inteira (textos, bordas, hover, badge). Removi do `:root` local os nomes que já são tokens globais, mantendo só os realmente locais (`--cream2`, `--gold-light`) que não têm token correspondente na tabela. Os usos de `var(--ink)`, `var(--ink3)`, `var(--gold)`, `var(--bdr)` etc. no restante do CSS já eram bare (sem fallback) e agora resolvem corretamente para os tokens globais claros/escuros. (Mesmo bug que o Agente D encontrou nas páginas de auth — ver observação dele acima; aqui eu efetivamente corrigi em vez de só documentar, porque remover os nomes duplicados do `:root` não altera classes/props/lógica, só a fonte de onde a cor vem.)
- `src/modules/dashboard/pages/DashboardPage.tsx` — mesmo bug de `:root` local redeclarando tokens globais, mesma correção aplicada (mantive só `--cream2`/`--gold-light`) + 1 hex direto migrado (card de "nenhum alerta": `background` → `--card-bg`, `color` → `--ink3`).
- `src/modules/dashboard/components/KpiCards.tsx` — 1 (`background: '#fff'` → `--card-bg`).
- `src/modules/dashboard/components/RiskAlerts.tsx` — 1 (`background: '#fff'` → `--card-bg`).
- `src/modules/dashboard/components/WorksStatusTable.tsx` — 1 (`background: '#fff'` → `--card-bg`).
- `src/modules/dashboard/components/WorksEvolutionChart.tsx` — 3 (card `background` → `--card-bg`; eixos X/Y `fill:'#7A7670'` → `--ink3`). Barras/série (`#1E8449`, `#1A5276`, `#C0392B`) e a faixa decorativa verde no topo ficaram como estão (semânticas/status).
- `src/modules/dashboard/components/FinancialChart.tsx` — 3 (card `background` → `--card-bg`; eixos X/Y `fill:'#7A7670'` → `--ink3`). Linhas/gradientes de série (`#B8922A`/`#1A5276` como *stroke*/*stopColor* das áreas Previsto/Realizado) ficaram como estão — são cores de série do gráfico, não de UI estrutural, mesmo coincidindo com o hex de `--gold`.
- `src/components/LdDateInput.tsx` — 5 (`--card-bg` em trigger/popover/nav-btn, `--gold` no ícone, `--bdr` na borda do nav-btn).
- `src/components/LdSelect.tsx` — 3 (`--card-bg` em trigger/dropdown, `--gold` no chevron).

`npx tsc --noEmit` rodou limpo (sem erros).

**Cores estruturais encontradas que NÃO batem com nenhum token da tabela (deixadas como estão, não migradas):**
- `rgba(26,24,20,0.15|0.28|0.55|0.12|0.18|0.25|0.06|0.20|0.04|0.05|0.08|0.09)` — variações de opacidade de borda/sombra usadas em `LdDateInput.tsx`, `LdSelect.tsx`, `WorksStatusTable.tsx`, `WorksEvolutionChart.tsx`, `FinancialChart.tsx`, `RiskAlerts.tsx`, `KpiCards.tsx`, `DashboardPage.tsx` — nenhuma bate exatamente com `--bdr` (0.10) ou `--bdr-strong` (0.22), só migrei as que batiam exatamente.
- `rgba(26,24,20,0.4)` (overlay mobile) e `rgba(26,24,20,0.7)`/`rgba(26,24,20,0.25)` (botão flutuante mobile) em `DashboardLayout.tsx` — não batem com `--bdr`/`--bdr-strong`.
- `.db-hero` em `DashboardPage.tsx` usa `linear-gradient(135deg,var(--ink) 0%,#2C2820 100%)` como fundo de um hero sempre-escuro (com texto branco fixo), e `Sidebar.tsx` usa `background:var(--ink)` no `.sb-logo-mark` (caixa da logo "L", texto branco fixo). Esses dois já usavam `var(--ink)` antes da minha correção do bug de `:root`; agora que os tokens globais não são mais mascarados, esse `var(--ink)` vai resolver para a cor de texto clara no tema escuro (já que `--ink` inverte), o que deixaria o fundo do hero/logo claro com texto branco por cima — baixo contraste. Antes da correção do bug isso não acontecia (ficava sempre escuro por acidente). Provavelmente esses dois pontos deveriam usar um hex fixo (não seguir o token `--ink`, que é semântico para *texto*) em vez de `var(--ink)` — não fiz essa mudança porque não é troca de "hex por token" e sim uma correção de design fora do escopo desta tarefa; sinalizando aqui para revisão dedicada.
- Cores `#fff` usadas como texto sobre fundos coloridos fixos (ex.: `.sb-logo-mark span{color:#fff}`, dias selecionados no calendário, botão mobile) foram deixadas como estão — não são fundo/estrutural, são texto de contraste fixo sobre acento dourado/escuro.
