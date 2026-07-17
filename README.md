# The Last Reroll

> The dice chooses. Your reaction tells the truth.

The Last Reroll is a one-minute decision ritual for people who have already
thought a problem to death. A user names a decision and two to six options,
rolls a die, and records their immediate emotional reaction to the result. The
app turns that reaction into a small, reversible next step.

## Why it exists

Randomness is useful because it interrupts rumination. The roll is not treated
as advice or prophecy; it creates a moment in which relief, disappointment,
anxiety, or the urge to reroll becomes visible.

## Product flow

1. Write the decision and its options.
2. Roll an animated six-sided die.
3. Record the first reaction before rationalizing it.
4. Receive a concise interpretation and a 24-hour experiment.
5. Share a lightweight “fate receipt” if desired.

The current version requires no account and sends no decision text to a server.

## Built with Codex and GPT-5.6

The product was designed and implemented during OpenAI Build Week in a Codex
session powered by GPT-5.6. Codex was used to:

- turn the initial “decide by dice” idea into the reaction-reveal product loop;
- make the central product decision that the dice should interrupt rumination,
  not present itself as authoritative advice;
- implement the complete responsive experience, dice animation, accessible
  controls, sharing flow, and reduced-motion behavior;
- replace starter checks with product-specific server-rendering tests;
- build and deploy the working application.

The key human product decision was to keep version one private, immediate, and
useful without requiring an API key or collecting sensitive dilemmas. GPT-5.6
helped shape and build the experience; it does not impersonate a therapist or
make high-stakes decisions for the user.

## Run locally

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validate

```bash
npm test
```

The test command creates a production build and verifies that the deployed
worker renders the finished decision experience.

## Stack

- Next.js-compatible React application via vinext
- TypeScript
- CSS with responsive and reduced-motion states
- OpenAI Sites / Cloudflare Worker-compatible deployment

## Safety boundary

The Last Reroll is an entertainment and self-reflection tool, not medical,
legal, financial, or mental-health advice. Users should not leave consequential
or irreversible decisions to chance.
