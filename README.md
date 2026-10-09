# saas-starter-template

This is the template behind RapidBuild's **saas-starter** preset: a Next.js 15
SaaS on Drizzle and Postgres, with email, Google and GitHub sign-in, groups,
Stripe subscriptions, and file uploads. It is
[webdevcody/wdc-saas-starter-kit](https://github.com/webdevcody/wdc-saas-starter-kit)
with that project's history kept, plus what a product built by agents needs
before its first change:

- `.rapidbuild.yml`, which states how to install, check and run it.
- `AGENTS.md`, which says how to work in it. Read this first.
- A test command, and CI that refuses a migration history with two heads or
  a schema change without its migration.
- Local mocks of every outside service, so it runs with nothing but a
  Postgres (`src/capabilities/`).
- One brand file with four slots (`brand/brand.json`).
- `docker-compose.yml` with Postgres 16 and a mail-catcher, pinned by digest.
- A Playwright e2e skeleton.
- A Render deploy that a person starts by hand (`render.yaml`,
  `.github/workflows/deploy.yml`).

Quick start:

```bash
docker compose up -d
npm ci --no-audit --no-fund --ignore-scripts && npm run postinstall
export DATABASE_URL=postgresql://postgres:example@localhost:5432/postgres
npm run test          # migrate, seed, test
npm run dev           # http://localhost:3000, sign in as testing@example.com / 12345678
```

**Releases are tags on `main`, and `main` is the latest release.** GitHub's
"generate from template" copies the default branch and takes no tag or
commit, so `main` is never ahead of the newest tag. A preset names a tag and
that tag's commit, and a repository generated from this template should
start at exactly that commit. To release, commit to `main`, tag it `vX.Y.Z`
on that same commit, and update the preset to the new tag and SHA.

**A repository generated from this one can be empty for a few seconds.**
GitHub answers the generate request before the files have been copied. A
clone or a read made straight after can see an empty default branch, so
wait for the first commit to appear before using the new repository.

**Deploying needs three values, none of them in this repository.** Whoever
owns the product's Render account sets them in the generated repository's
Settings → Secrets and variables → Actions: the secret `RENDER_API_KEY`, and
the variables `RENDER_STAGING_SERVICE_ID` and `RENDER_PRODUCTION_SERVICE_ID`.
On RapidBuild, the platform copies the workspace's stored Render key in at
Release. Provider keys for live mode go into Render (`sync: false` in
`render.yaml`), never into this repository.

The starter's own README follows.

---

Notice! this starter kit isn't fully finished, but I'm just making this public for now if anyone wants to add onto it. I'm getting burned out on working on this so I'm open to anyone wanting to help contribute to fixing up any bugs they find, etc.

# Discord

You can join the discord if you want to talk about the code here or suggest features / etc.

[https://discord.gg/N2uEyp7Rfu](https://discord.gg/N2uEyp7Rfu)

# Code Walkthrough (Early Access)

For those wanting more hands on video walkthrough content that explains this code base, shows how to deploy it, and how to maintain it in production, I'm working on a paid video walkthrough series found here [https://webdevcody.gumroad.com/l/wdc-saas-starter-kit-walkthrough](https://webdevcody.gumroad.com/l/wdc-saas-starter-kit-walkthrough). I'm in the process of recording and editing videos, but if you purchase now it's 50% off the original pricing.

# Welcome to the Starter Kit

Welcome to the WDC Next.js Starter Kit! This is a github template which contains the following technology we feel is a great starting point for any new SaaS product:

- Authorization
- Subscription Management (Stripe)
- Stripe Integration / Webhooks
- Group Management
- File Upload to R2
- Drizzle ORM
- Light / Dark Mode
- ShadCN
- Tailwind CSS
- Posthog Analytics

## Contributing

If you find obvious issues with this starter kit, feel free to submit a pull request or submit and issue. We want to keep this starter simple with the core technology picked, so we don't recommend trying to add in various things without prior approval.

## How to Get Started

Start by clicking the "use this template" button on the github repo. We suggest creating a new repository so you can track your code changes. After, clone your own repository down to your computer and start working on it.

### Prerequisites

This starter kit does uses Docker and Docker Compose to run a postgres database, so you will need to either have those installed, or modify the project to point to a hosted database solution.

## How to Run

1. `cp .env.sample .env`
2. `npm i`
3. `docker compose up`
4. `npm run db:migrate`
5. `npm run dev`

## Env Setup

This starter kit depends on a few external services, such as **google oauth**, **stripe**, and **resend**. You'll need to following the steps below and make sure everything is setup and copy the necesssary values into your .env file:

## Resend

Create an account on https://resend.com/ and generate an api key and paste into **EMAIL_SERVER_PASSWORD**

Setup your domain in resend so that you can send emails from your custom domain and set **EMAIL_FROM** to match your expected from line. To do this, go to your domain provider and add the necessary records outlined in resend.

## Cloudflare R2

TODO: add info about bucket and keys

## Database

This starter kit uses postgres. Supabase provides 2 free postgres database. Setup a database and get your **DATABASE_URL**.

## Stripe Setup

This starter kit uses stripe which means you'll need to setup a stripe account at https://stripe.com. After creating an account and a project, you'll need to set the following env variables:

- STRIPE_API_KEY
- NEXT_PUBLIC_STRIPE_KEY
- STRIPE_WEBHOOK_SECRET
- PRICE_ID
- NEXT_PUBLIC_STRIPE_MANAGE_URL

How you can find these are outlined below:

### Stripe Keys

You need to define both **NEXT_PUBLIC_STRIPE_KEY** and **STRIPE_API_KEY** inside of .env. These can get found here:

- https://dashboard.stripe.com/test/apikeys

### Webhook Keys

Depending on if you are developing locally or deploying to prod, there are two paths you need to take for getting a webhook key:

### Local Development

1. Install the Stripe CLI:
   For macOS or Linux, you can use Homebrew: `brew install stripe/stripe-cli/stripe`

- For Windows, you can use the Windows installer from the Stripe CLI GitHub releases page - https://github.com/stripe/stripe-cli/releases

2. Add Stripe CLI to your PATH:
   Ensure the directory containing the Stripe CLI executable is in your system's PATH environment variable.
3. We provided an npm alias `stripe:listen` you can run if you want to setup your locally running application to listsen for any stripe events. Run this command and copy the webhook secret it prints to the console into your .env file.

### Production

When going to production, you'll need to create a webhook endpoint and copy your webhook secret into _STRIPE_WEBHOOK_SECRET_:

1. https://dashboard.stripe.com/test/webhooks
2. create an endpoint pointing to https://your-domain.com/api/webhooks/stripe
3. listen for events invoice.payment_succeeded and checkout.session.completed
4. find your stripe secret key and copy into your projects

### Price Id (Product)

You'll need to create a subscription product in stripe:

1. https://dashboard.stripe.com/products/create
2. Make your one time product
3. Copy the price id
4. paste price id into .env of **PRICE_ID**

### Customer Portal

Stripe has a built in way for customers to cancel their subscriptions. You'll need to enable this feature:

1. https://dashboard.stripe.com/settings/billing/portal
2. Click activate portal link button
3. Copy your portal link
4. Paste as env variable as NEXT_PUBLIC_STRIPE_MANAGE_URL

## HOST_NAME

When deplying to production, you want to set HOST_NAME to your FQDN, such as `https://you-domain.com`

## Auth Setup

### Google Provider

By default, this starter only comes with the google provider which you'll need to setup:

1. https://console.cloud.google.com/apis/credentials
2. create a new project
3. setup oauth consent screen
4. create credentials - oauth client id
5. for authorized javascript origins

- http://localhost:3000
- https://your-domain.com

6. Authorized redirect URIs

- http://localhost:3000/api/login/google/callback
- https://your-domain.com/api/login/google/callback

7. Set your google id and secret inside of .env

- **GOOGLE_CLIENT_ID**
- **GOOGLE_CLIENT_SECRET**

### Github provider

TODO: add info

## Posthog
