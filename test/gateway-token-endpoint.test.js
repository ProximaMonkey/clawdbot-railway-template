import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const src = fs.readFileSync(new URL("../src/server.js", import.meta.url), "utf8");

test("server exposes /setup/api/gateway-token endpoint", () => {
  assert.match(src, /app\.get\("\/setup\/api\/gateway-token"/);
});

test("/setup/api/gateway-token is protected by requireSetupAuth", () => {
  // The endpoint declaration must include requireSetupAuth as a middleware argument.
  assert.match(src, /app\.get\("\/setup\/api\/gateway-token",\s*requireSetupAuth/);
});

test("/setup/api/gateway-token returns the token in JSON", () => {
  // The handler must reference OPENCLAW_GATEWAY_TOKEN and return it as { token: ... }.
  const idx = src.indexOf('app.get("/setup/api/gateway-token"');
  assert.ok(idx >= 0, "endpoint not found");
  // Grab a window large enough to cover the full handler body.
  const window = src.slice(idx, idx + 600);
  assert.match(window, /OPENCLAW_GATEWAY_TOKEN/);
  assert.match(window, /token.*OPENCLAW_GATEWAY_TOKEN/s);
});

test("/setup/api/gateway-token sets Cache-Control: no-store", () => {
  const idx = src.indexOf('app.get("/setup/api/gateway-token"');
  assert.ok(idx >= 0, "endpoint not found");
  const window = src.slice(idx, idx + 600);
  assert.match(window, /Cache-Control.*no-store/);
});

test("/setup/api/gateway-token returns 503 when token is unavailable", () => {
  const idx = src.indexOf('app.get("/setup/api/gateway-token"');
  assert.ok(idx >= 0, "endpoint not found");
  const window = src.slice(idx, idx + 600);
  assert.match(window, /503/);
});
