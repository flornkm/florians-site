// One-time helper to obtain a STRAVA_REFRESH_TOKEN for the runs sync.
//
//   1. Create a Strava API app: https://www.strava.com/settings/api
//      Set "Authorization Callback Domain" to exactly: localhost
//   2. Put STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in .env (bun loads it automatically).
//   3. Run:  bun scripts/strava-auth.ts
//   4. Your browser opens — click Authorize. The script auto-captures the redirect,
//      exchanges it, and prints STRAVA_REFRESH_TOKEN. No copy-pasting of codes.
//
// The refresh token does not expire, so this is a one-time setup.

import { exec } from "node:child_process";
import { createServer } from "node:http";
import { createInterface } from "node:readline/promises";
import { platform, stdin, stdout } from "node:process";

const PORT = Number(process.env.STRAVA_AUTH_PORT ?? 8721);
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPE = "activity:read_all";

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

function openBrowser(url: string): void {
  const cmd = platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  exec(`${cmd} "${url}"`);
}

// Starts a throwaway local server and resolves with the `code` Strava redirects back with.
function waitForCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", REDIRECT_URI);
      if (url.pathname !== "/callback") {
        res.statusCode = 404;
        res.end();
        return;
      }

      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      res.setHeader("Content-Type", "text/html");

      if (error || !code) {
        res.end("<p>Authorization failed. You can close this tab.</p>");
        server.close();
        reject(new Error(error ?? "Strava returned no code"));
        return;
      }

      res.end("<p>✅ Authorized. Close this tab and return to your terminal.</p>");
      server.close();
      resolve(code);
    });

    server.on("error", reject);
    server.listen(PORT);
  });
}

async function exchangeCode(clientId: string, clientSecret: string, code: string): Promise<string> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { refresh_token?: string };
  if (!data.refresh_token) throw new Error("Token exchange returned no refresh_token");
  return data.refresh_token;
}

async function main() {
  const clientId = process.env.STRAVA_CLIENT_ID ?? (await ask("Strava Client ID: "));
  const clientSecret = process.env.STRAVA_CLIENT_SECRET ?? (await ask("Strava Client Secret: "));
  if (!clientId || !clientSecret) throw new Error("Missing client id/secret.");

  const authorizeUrl =
    `https://www.strava.com/oauth/authorize?client_id=${clientId}` +
    `&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&approval_prompt=force&scope=${SCOPE}`;

  // Begin listening before opening the browser so the redirect can't race us.
  const codePromise = waitForCode();
  console.info(`\nListening on ${REDIRECT_URI} — opening Strava in your browser…`);
  console.info(`If it doesn't open, paste this URL:\n${authorizeUrl}\n`);
  openBrowser(authorizeUrl);

  const refreshToken = await exchangeCode(clientId, clientSecret, await codePromise);
  console.info("\n✅ Add this to .env and your Vercel project env:\n");
  console.info(`STRAVA_REFRESH_TOKEN=${refreshToken}\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
