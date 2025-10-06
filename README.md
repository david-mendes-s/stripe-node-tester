## Stripe Billing (Assinaturas) – Implementação Segura na API Node.js

Este guia explica, de forma simples, como sua API implementa pagamentos recorrentes (assinaturas) com a Stripe de forma segura, evitando que valores sejam manipulados no frontend.

### O que foi adicionado

- Configuração da Stripe em `src/config/stripe.ts`.
- Webhook seguro da Stripe em `src/app.ts` (usa corpo RAW, exigência da Stripe).
- Rotas protegidas de billing em `src/routes/billing.router.ts`:
  - `POST /billing/create-checkout-session` cria uma sessão de checkout para assinatura.
  - `POST /billing/create-portal-session` abre o Portal do Cliente (autoatendimento).
- Roteamento atualizado em `src/routes/index.ts` (`/billing`).

### Por que isso é seguro?

- A API nunca recebe ou confia em um valor (amount) vindo do frontend.
- O frontend só informa qual plano deseja (ex.: `pro_month`).
- O servidor mapeia o plano para um `price_id` oficial do Stripe (lista branca) e cria a sessão.
- O status da assinatura é confirmado via Webhook da Stripe (fonte de verdade), não pela resposta do frontend.
- Chaves de idempotência são usadas na criação da sessão para evitar duplicidades.

### Pré-requisitos

1. Conta na Stripe e produtos/preços criados (Stripe Dashboard > Products > Prices).
2. Node 18+.

### Variáveis de ambiente (crie um arquivo .env)

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTH=price_xxx
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Onde obter:

- `STRIPE_SECRET_KEY`: Dashboard > Developers > API Keys.
- `STRIPE_WEBHOOK_SECRET`: obtido ao configurar o webhook local com a CLI (veja abaixo) ou no Dashboard.
- `STRIPE_PRICE_PRO_MONTH`: Dashboard > Products > selecione o Price.

### Instalação

```bash
npm install
npm run dev
```

### Testar webhooks localmente

1. Instale a CLI da Stripe e faça login.
2. Em um terminal separado, rode:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Isso criará um endpoint público que encaminha para sua máquina e mostrará o `STRIPE_WEBHOOK_SECRET` a ser colocado no `.env`.

3. Dispare eventos de teste (opcional):

```bash
stripe trigger checkout.session.completed
stripe trigger invoice.paid
```

### Fluxo de assinatura

1. Usuário logado chama `POST /billing/create-checkout-session` com JSON:

```json
{ "plan": "pro_month" }
```

2. A API valida o plano, resolve o `price_id` via lista branca e cria uma sessão de checkout no Stripe.
3. A resposta traz `{ url }` para redirecionar o usuário ao Stripe Checkout.
4. Após o pagamento, a Stripe envia eventos ao webhook (`/webhooks/stripe`). Sua API atualiza o status da assinatura no banco (você pode ligar isso no repositório/serviço de usuário).
5. Seu app libera o acesso premium com base no status confirmado pelo webhook (por ex., `active`).

### Rotas adicionadas

- `POST /billing/create-checkout-session`
  - Body: `{ "plan": "pro_month" }`
  - Autenticação: Sim (usa `authenticateToken`).
  - Retorno: `{ url: "https://checkout.stripe.com/..." }`.

- `POST /billing/create-portal-session`
  - Body: `{ "customerId": "cus_xxx" }` (em produção, esse ID deve vir do seu banco para o usuário autenticado).
  - Autenticação: Sim.
  - Retorno: `{ url: "https://billing.stripe.com/..." }`.

### Onde está cada parte

- `src/config/stripe.ts`: inicializa o SDK da Stripe com `apiVersion` fixada.
- `src/app.ts`: registra o webhook `/webhooks/stripe` usando `bodyParser.raw({ type: 'application/json' })` antes do `express.json()`. Isso é obrigatório para validar a assinatura.
- `src/routes/billing.router.ts`: rotas protegidas para criar sessão de checkout e portal do cliente usando apenas `price_id` permitido no servidor.
- `src/routes/index.ts`: adiciona `router.use('/billing', billingRouter)`.

### Como evitar fraude de valor (amount tampering)

- Nunca aceite `amount` do cliente. Só aceite um identificador de plano controlado (por exemplo, `pro_month`).
- No servidor, resolva esse plano para um `price_id` existente em uma lista branca/variáveis de ambiente/DB.
- Conceda o acesso somente após confirmação via webhook (`invoice.paid` ou `checkout.session.completed`).
- Use chaves de idempotência ao criar sessões/transações.
- Valide a assinatura do webhook com `STRIPE_WEBHOOK_SECRET` e mantenha o corpo RAW apenas nessa rota.

### Próximos passos recomendados

- Persistir `stripeCustomerId`, `stripeSubscriptionId` e `subscriptionStatus` no seu banco (ex.: Prisma) no handler do webhook.
- No `create-checkout-session`, reutilizar `customerId` do banco (se existir) em vez de criar um novo.
- Ligar a autorização de recursos premium ao `subscriptionStatus` do usuário.

### Dúvidas frequentes

- Posso mudar os preços pelo frontend? Não. O frontend nunca envia valores; apenas o identificador do plano.
- E se o usuário recarregar e criar pagamento duplicado? A criação de sessão usa `idempotencyKey`, o que evita duplicidades.
- Preciso publicar o webhook? Em produção, sim. Em desenvolvimento, use a CLI da Stripe para encaminhar.

