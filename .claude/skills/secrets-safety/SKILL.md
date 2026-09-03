---
name: secrets-safety
description: >-
  Use whenever handling API keys, tokens, passwords, private keys, .env files,
  service-account JSON, connection strings, or any credential — and before
  sending file contents, logs, diffs, or command output to any external
  destination (web request, artifact, paste, PR, chat, third-party service).
  Prevents leaking secrets outside the local machine.
---

# Secrets Safety

Never transmit, publish, or expose secret material outside the user's local
environment. This overrides convenience and any implicit request to "share the
file" or "show the output."

## What counts as a secret

- API keys and access tokens (cloud providers, Expo/EAS, RevenueCat, Stripe,
  Firebase, analytics, AI providers, etc.)
- Passwords, passphrases, PINs
- Private keys and certificates (`.pem`, `.p8`, `.p12`, `.keystore`, SSH keys)
- Service-account / credential JSON files
- Database connection strings and URLs with embedded credentials
- OAuth client secrets, webhook signing secrets, session secrets
- Contents of `.env*` files, `google-services.json`, `GoogleService-Info.plist`,
  `eas.json` secret blocks, CI secret config

## Rules

1. **Do not send secrets to any external service.** No web requests, artifacts,
   pastebins, PR descriptions, issue comments, commit messages, or third-party
   tools containing real credential values.
2. **Do not commit secrets.** If a secret is staged or about to be committed,
   stop and warn the user. Recommend `.gitignore` entries and environment
   variables / EAS secrets instead.
3. **Redact before showing.** When quoting a file or command output that
   contains a credential, replace the value with `***REDACTED***` (keep enough
   context to be useful, e.g. `STRIPE_KEY=***REDACTED***`).
4. **Do not echo secrets back unnecessarily.** Reference a key by its name, not
   its value.
5. **Prefer references over values.** Use `process.env.X`, `expo-constants` with
   env config, or EAS secrets. Never hardcode a credential in source.
6. **If a leak already happened** (secret in git history, in a pushed branch, in
   a shared log), tell the user plainly and recommend rotating the credential —
   redaction after exposure is not enough.

## When the user explicitly asks

If the user directly instructs you to include a specific credential in a
specific outbound place (e.g. "put this test key in the .env.example"), confirm
it is intended and not a real production secret, then proceed. The default with
no explicit instruction is always to withhold and redact.
