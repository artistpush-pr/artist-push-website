# ТЗ: PayPal-recovery для Breakout Music

Статус: **затверджено Яною 2026-08-06, реалізація ще не почата** (чекає «роби» + доступ до D1).
Аналог працюючої автоматизації Artist Push (`~/Music Club/artistpush-recovery/`), адаптований під стек Breakout.

---

## 1. Проблема

PayPal на Breakout — ручний флоу. Воркер створює замовлення `BRK-xxxx` з `payment_method='paypal'`,
`payment_status='unpaid'`, шле HTML-лист з інструкцією (надіслати F&F на yana_grishkina@ukr.net,
потім відписати з ID транзакції) — і на цьому все. Якщо людина не заплатила, ніхто не нагадує.
Карткові провайдери (HiPay, Cardinity) сюди НЕ входять: там `unpaid` означає відмову картки,
а не забуту оплату, і турбувати цих людей не треба (пряма вимога Яни).

## 2. Архітектура

**Окремий воркер `breakout-recovery`, НЕ доробка `breakout-api`.**
Причина: `breakout-api` — живий платіжний API (HiPay, Cardinity, вебхуки). Будь-який деплой туди
ризикує прийомом оплат. Окремий воркер біндиться до тієї самої D1 (одну БД можна прив'язати до
кількох воркерів) і фізично не може зламати чекаут.

- D1: `breakout-db`, id `6c1cc3c4-0137-4151-921a-5ace3fc30253` (акаунт f9b3155c15a61dd5b71bacece768be05)
- Cron: `*/15 * * * *` (як на Artist Push)
- Журнал відправок: **окремий KV**, не таблиця в D1 — щоб не робити міграцію живої платіжної бази
- Пошта: Brevo API, `BREVO_API_KEY` (свій секрет воркера), sender `hello@breakoutmusic.io`,
  ім'я **Jay Finn** (gmail-відправник не проходить DKIM — тільки доменний)
- Telegram-пінг у той самий чат 418231145, префікс `[BRK]`

## 3. Критерії відбору (усі мають виконатись)

```sql
SELECT o.id, o.order_number, o.total_amount, o.currency, o.created_at,
       c.email, c.name
FROM orders o JOIN customers c ON c.id = o.customer_id
WHERE o.payment_method = 'paypal'      -- ТІЛЬКИ PayPal
  AND o.payment_status = 'unpaid'
  AND o.created_at BETWEEN ... -- вік 1–48 год
```
Плюс у коді: `looksReal(email)` (той самий фільтр junk-доменів), відсутність у журналі,
**повторна перевірка `payment_status` безпосередньо перед відправкою**.

**Порогу суми НЕМАЄ** (рішення за замовчуванням, Яна на питання не відповіла однозначно —
логіка: людина вже оформила замовлення і свідомо обрала PayPal, це не кинутий кошик).
Міняється однією константою.

**Один дотик** через ~1 годину. Другого (24/72 год) не робимо.

## 4. Перший запуск — заморозка бэклогу

Обов'язково. Перший прогін нічого не шле, а записує всі наявні неоплачені PayPal-замовлення
в журнал як `seeded`. Ендпоінт `/seed?key=...&all=1`. Інакше — лавина листів по всьому архіву.

## 5. Лист

Плоский текст «від людини», без банерів/кнопок/логотипів. Перший лист (інструкція) лишається
гарним HTML-шаблоном — нагадування навмисно виглядає як особисте повідомлення, саме ця різниця
дає відгук. **Без знижки і без промокоду** (рішення Яни). Тире мінімізувати (правило Яни:
тире = маркер AI; крапка/кома/двокрапка/знак оклику).

Subject: `Order #BRK-1123 is still waiting for payment`

```
Hi {Name},

Thanks for your order with Breakout!

I noticed order #BRK-1123 is still waiting for payment. Nothing is lost,
your order is saved and ready to start as soon as the payment arrives:

1 × Spotify Plays, 5000: $18.00
Total: $18.00 USD

To complete it, send the payment via PayPal to yana_grishkina@ukr.net.
Please choose Friends & Family, and don't add any notes or descriptions.

Once you've paid, just reply to this email with your PayPal transaction ID
and I'll confirm it and start your campaign right away.

If something went wrong at checkout or you'd rather pay another way,
reply and I'll sort it out.

Jay Finn
Breakout
```

Ім'я береться з `customers.name` (може бути NULL → фолбек «Hi,»), позиції з `order_items`
(`platform`, `service_type`, `service_variant`, `quantity`, `unit_price`).

## 6. Службові ендпоінти (усі під `TEST_SECRET`)

`/run?dry=1` — сухий прогін; `/run` — ручний запуск; `/send-one?order=BRK-1123` — ручна відправка;
`/seed?all=1` — заморозка; `/test-email?to=` — зразок; `/config` — показати живу конфігурацію;
`/health` — без ключа.

## 7. Порядок запуску

1. Розблокувати доступ до D1 (див. §8).
2. Код + `npx wrangler deploy`.
3. `/seed?all=1` — заморозка бэклогу.
4. `/run?dry=1` — показати Яні список кандидатів.
5. Бойовий режим.
6. Тиждень спостереження: пінги в TG + скільки замовлень перейшло в paid.

## 8. 🔴 БЛОКЕР перед реалізацією

`npx wrangler d1 execute breakout-db --remote` повертає **«The given account is not valid or is not
authorized to access this service» (code 7403)**. Тобто поточний логін wrangler не має доступу до
акаунта, де живе база Breakout. Потрібно або окремий `wrangler login` під потрібний акаунт, або
API-токен з правами D1. Без цього не можна ні подивитись реальні цифри (скільки взагалі
неоплачених PayPal-замовлень), ні задеплоїти воркер з біндингом до цієї бази.

## 9. Свідомо НЕ робимо

- Не чіпаємо HiPay/Cardinity/Stripe-замовлення.
- Не додаємо знижку/промокод.
- Не робимо другий і третій дотик.
- Не чіпаємо `breakout-api` і його схему БД.
- Abandoned checkout для Breakout (в адмінці є така вкладка) — окрема задача, не в цьому ТЗ.
