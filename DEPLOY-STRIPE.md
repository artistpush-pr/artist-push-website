# Stripe Integration — Deploy Checklist

Поетапний план для першого деплою. **Йди по порядку.** Кожен крок ~2-5 хв.

---

## 📋 Передумова

В тебе вже є:
- ✅ Stripe test secret key: `sk_test_51TdVB3BInKPeFJ8f...` (вже в моїй пам'яті, додаси через wrangler)
- ✅ Worker `breakout-api` задеплоєний
- ✅ D1 база `breakout-db` працює

---

## STEP 1 — Migration D1: додати 2 нові колонки

В терміналі:

```bash
cd /Users/yanahryshkina/Desktop/artist-push-website/breakout-api

npx wrangler d1 execute breakout-db --remote --file=migrate-stripe.sql
```

**Очікуваний результат:**
```
[
  { name: 'stripe_session_id' },
  { name: 'stripe_payment_intent' },
  { name: 'stripe_payment_url' },        ← нове
  { name: 'stripe_session_expires_at' }  ← нове
]
```

Якщо побачиш `duplicate column name` — нічого страшного, це означає що колонка вже є.

---

## STEP 2 — Додати Stripe Secret Key як Worker secret

```bash
cd /Users/yanahryshkina/Desktop/artist-push-website/breakout-api

npx wrangler secret put STRIPE_SECRET_KEY
```

→ Wrangler попросить вставити значення. Встав:

```
<paste-your-test-key-from-stripe-dashboard>
```

Натисни Enter. Має вивести `Success! Uploaded secret STRIPE_SECRET_KEY`.

---

## STEP 3 — Перший деплой Worker (без webhook поки що)

```bash
npx wrangler deploy
```

**Зачекай поки задеплоїться** (~10 сек). Потім перевір:

```bash
curl https://breakout-api.artistpushnet.workers.dev/api/health
# або який в тебе Worker URL
```

---

## STEP 4 — Створити Webhook у Stripe Dashboard

1. Відкрий: **https://dashboard.stripe.com/test/webhooks** (переконайся що Test mode увімкнено!)
2. Тисни **"+ Add endpoint"**
3. **Endpoint URL:** твій Worker URL + `/api/webhooks/stripe`
   - Наприклад: `https://breakout-api.artistpushnet.workers.dev/api/webhooks/stripe`
4. **Description:** `Breakout payments`
5. **Events to send** — клацни **"+ Select events"** і вибери:
   - `checkout.session.completed` ✅ (основна)
   - `charge.refunded` ✅
   - `payment_intent.payment_failed` ✅
6. Тисни **"Add endpoint"**
7. На сторінці створеного webhook'а — знайди **"Signing secret"**, тисни **"Reveal"**
8. Скопіюй значення (`whsec_xxxxxxxxxxxxxxxxxxxx`)

---

## STEP 5 — Додати Webhook Secret як Worker secret

```bash
cd /Users/yanahryshkina/Desktop/artist-push-website/breakout-api

npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

→ Встав значення `whsec_...` що скопіювала на попередньому кроці → Enter.

---

## STEP 6 — Другий деплой Worker (тепер з webhook secret)

```bash
npx wrangler deploy
```

---

## STEP 7 — Закомітити frontend і запушити

```bash
cd /Users/yanahryshkina/Desktop/artist-push-website

git add checkout.html checkout-api.js success.html admin.html
git commit -m "feat: Stripe payment method (API-automated flow)"
git push
```

Cloudflare Pages автоматично задеплоїть фронт через 1-2 хв.

---

## STEP 8 — Тестова покупка

1. Відкрий https://breakoutmusic.io в **incognito** вікні (щоб не було кешу)
2. Додай будь-який товар в кошик (наприклад Spotify Plays 1K = $6)
3. Натисни Checkout
4. Заповни email (можеш використати свій yana_grishkina@ukr.net)
5. **Вибери Card (Stripe)** як payment method
6. Прийми Terms
7. **Place Order — $6.00**
8. На success page має побачити "Order Received!" з повідомленням про Stripe email

**Перевір пошту:**
- Має прийти лист `Breakout | Complete Your Stripe Payment | Order #BRK-XXXX`
- Велика зелена кнопка `Pay $6.00`

**Клікни кнопку** → відкриється Stripe-хостед сторінка. Заповни:
- Card number: `4242 4242 4242 4242`
- Exp: будь-яка майбутня (`12/30`)
- CVC: `123`
- Email: автоматично
- Name: будь-яке

**Натисни Pay.** Має:
1. Тебе редиректнути на `/success?order=BRK-XXXX&session_id=cs_test_...`
2. Сторінка покаже **"Payment Received!"**

**Перевір в адмінці:**
- Зайди в /admin
- Подивись на цей замовлення — payment status має автоматично стати **Paid**
- В колонці Method — `stripe`

**Перевір Google Sheets:**
- Має з'явитися новий рядок у відповідному табі (Spotify/SoundCloud)

**Перевір другий email:**
- Має прийти "Payment received — your Breakout campaign is starting" (вже існуючий confirmation email)

---

## STEP 9 — Тестові карти для різних сценаріїв

| Card | Поведінка |
|---|---|
| `4242 4242 4242 4242` | ✅ Успішна оплата |
| `4000 0000 0000 9995` | ❌ Insufficient funds |
| `4000 0027 6000 3184` | ⚠️ Потребує 3D Secure (треба ввести `complete` на Stripe сторінці) |
| `4000 0000 0000 0341` | ❌ Decline (loose risk) |

---

## STEP 10 — Перевір Resend Stripe Email

1. В адмінці відкрий будь-яке Stripe замовлення в pending стані
2. У модалці маєш побачити кнопку **"✉ Resend Stripe Email"** (фіолетова)
3. Натисни → confirm → має прийти новий лист з тим же payment URL

---

## 🚀 Перехід на LIVE

Коли тести пройшли успішно і хочеш на бойовий режим:

1. Створи **Live mode** API key в Stripe Dashboard (toggle "Test mode" → OFF)
2. Створи **Live mode** webhook (так само як в STEP 4 але в live режимі)
3. В терміналі:
   ```bash
   cd breakout-api
   npx wrangler secret put STRIPE_SECRET_KEY        # встав sk_live_...
   npx wrangler secret put STRIPE_WEBHOOK_SECRET    # встав whsec_... (live версія)
   npx wrangler deploy
   ```
4. Зроби тестову покупку власною карткою на $5 → переконайся що все працює
5. Refund одним кліком у Stripe Dashboard

---

## 🐛 Якщо щось не працює

**Лист не прийшов:**
- Перевір логи Worker: `npx wrangler tail`
- Має бути рядок `STRIPE_EMAIL_FUNC_CALLED` і `STRIPE_BREVO_RESPONSE 201`

**Webhook не марк-ає Paid:**
- Логи Worker: шукай `STRIPE_WEBHOOK invalid_sig` → перевір що `STRIPE_WEBHOOK_SECRET` додано правильно
- В Stripe Dashboard → Webhooks → клікни на свій endpoint → побачиш список останніх подій з response code (200 = OK, 400/500 = помилка)

**"This order is not a Stripe order" при resend:**
- Це нормально для PayPal/інших замовлень. Resend кнопка має бути тільки для Stripe.

**Stripe Checkout сторінка показує 404:**
- Перевір `STRIPE_SECRET_KEY` (можливо опечатка / звичайний пароль замість token)
- Подивись логи Worker — має бути `STRIPE_SESSION_CREATE_FAILED` з деталями

---

Готово. Якщо застрягнеш на якомусь кроці — кинь скрін чи логи і допоможу.
