# Agents.md — WebLLM Chat

> Instructions for AI agents contributing to **WebLLM Chat**.  
> Last updated: 2026-09-08

---

## 1. Project Overview

WebLLM Chat is a private, browser-native AI chat interface built with [Next.js](https://nextjs.org/) and [WebLLM](https://github.com/mlc-ai/web-llm). It runs large language models directly in the browser via **WebGPU**, so conversations never leave the user's device.

Key characteristics:
- **Client-heavy**: Most logic lives in the browser (React client components, Web Workers, Service Workers).
- **Offline-first**: Supports static export and PWA via Serwist.
- **Hash-based routing**: Custom `RouterProvider` using `window.location.hash` — no Next.js file-system routing for views.
- **Zustand state**: Persisted stores for chat sessions and app config.
- **Multilingual**: i18n via locale files under `app/locales/`.

---

## 2. Useful Commands

### Package Manager
The project uses **Bun** (>= 1.3.0, currently pinned to `1.4.2`). Always prefer `bun` over `npm`, `yarn`, or `pnpm`.

```shell
# Install dependencies
bun install

# Run development server (Turbopack)
bun run dev

# Production build (standalone)
bun run build

# Start production server
bun run start

# Static export
bun run export

# Lint
bun run lint

# Format code
bun run format

# TypeScript type check
bun run typecheck
```

### Scripts
```shell
# Fetch prompt templates
bun run prompts

# Development with proxy (requires proxychains)
bun run proxy-dev
```

### Docker
```shell
# Build image
docker build -t webllm_chat .

# Run with optional proxy
docker run -d -p 3000:3000 webllm_chat

# Run behind proxy
docker run -d -p 3000:3000 \
  -e PROXY_URL=http://localhost:7890 \
  webllm_chat
```

---

## 3. Technologies & Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.3.4 (App Router) |
| **Runtime** | React 19.2.8 |
| **Language** | TypeScript 5.4.5 (strict mode) |
| **Package Manager** | Bun 1.4.2 |
| **Styling** | Sass (SCSS) |
| **State Management** | Zustand 4.3.8 with custom persistence |
| **Routing** | Custom hash-based router (`app/router.tsx`) |
| **LLM Engine** | @mlc-ai/web-llm 0.2.84 (WebGPU + Web Workers) |
| **Markdown** | react-markdown + rehype-highlight + rehype-katex + remark-gfm + remark-math + remark-breaks |
| **Icons** | lucide-react |
| **Utilities** | nanoid, fuse.js, use-debounce, html-to-image, emoji-picker-react, mermaid |
| **PWA / Offline** | Serwist 9.5.12 |
| **Linting** | ESLint 9 (flat config) + Prettier |
| **Formatting** | Prettier 3.9 |
| **Deployment** | Docker (multi-stage, oven/bun:1) |

---

## 4. Best Practices & Guidelines

### 4.1 Code Style
- **TypeScript**: Strict mode enabled (`strict: true` in `tsconfig.json`).
- **Formatting**: Prettier is enforced via ESLint (`prettier/prettier: "error"`).
  - Print width: 80
  - Indent: 2 spaces
  - Quotes: double quotes
  - Semicolons: required
  - Trailing commas: `all`
  - Arrow parens: `always`
- **ESLint**: Uses `eslint-config-next/core-web-vitals` + `eslint-config-prettier`.

### 4.2 React & Next.js Conventions
- **Client Components**: Top-level components in `app/page.tsx` are dynamically imported with `ssr: false` because the app relies heavily on browser APIs (WebGPU, localStorage, Workers).
- **App Router**: The `app/` directory is used, but routing is hash-based, not file-system based. Do not add `page.tsx` files expecting automatic routes.
- **Path alias**: `@/*` maps to the project root. Use it for imports (e.g., `import { X } from "@/app/constant"`).
- **Server vs Client**: Keep server-only code out of client bundles. The `browser` field in `package.json` stubs Node built-ins (`fs`, `path`, `stream`, etc.) to prevent bundler leaks.

### 4.3 State Management
- Zustand stores use `createPersistStore` (wrapper in `app/utils/store.ts`) for localStorage persistence.
- Stores should expose typed methods and avoid mutating state directly.
- Example stores: `app/store/chat.ts`, `app/store/config.ts`, `app/store/prompt.ts`, `app/store/template.ts`.

### 4.4 WebLLM & Worker Patterns
- **Engines**: `WebLLMApi` supports `ServiceWorkerMLCEngine` and `WebWorkerMLCEngine`.
- **Workers**: Source files in `app/worker/` (`web-worker.ts`, `service-worker.ts`).
- **Init progress**: Use `setInitProgressCallback` to surface model loading status.
- **Qwen3 thinking**: Special handling for `<think>` tags and `enable_thinking` flag. Do not strip `<think>` content unless the model is Qwen3 or `enable_thinking` is false.

### 4.5 Markdown & Rendering
- Use `react-markdown` with the configured rehype/remark plugins.
- KaTeX is enabled for math. Inline: `\\(x^2\\)`, block: `$$e=mc^2$$`.
- Code highlighting via `rehype-highlight`.

### 4.6 Browser Compatibility & Security
- **WebGPU required**: The app depends on WebGPU. Handle missing support gracefully with user-facing errors.
- **CSP**: Defined in `next.config.mjs`. Be careful when adding inline scripts or external resources; they must be allowed by the CSP header.
- **No eval unless necessary**: CSP allows `'unsafe-eval'` and `'unsafe-inline'` for script-src because of WebLLM/WASM constraints. Do not weaken CSP further without review.

### 4.7 Styling
- Use Sass modules (`.scss` / `.sass`).
- Follow existing class naming conventions (BEM-ish, utility classes in `components/ui-lib.tsx`).
- Dark mode and responsive design are expected.

### 4.8 i18n
- Locale files live in `app/locales/*.ts`.
- Use the `Locale` import for UI strings. Do not hardcode user-facing text.

### 4.9 Performance
- **Dynamic imports**: Heavy components (e.g., markdown renderer, settings panels) should be loaded dynamically.
- **Streaming**: LLM responses stream via `AsyncIterable`. Update UI incrementally.
- **Token estimation**: Use `estimateTokenLength` for context window management.
- **Memory**: Long-term memory summarization runs automatically when thresholds are exceeded.

---

## 5. Git & Collaboration

- **Branching**: No enforced naming convention, but feature branches should be descriptive.
- **Commits**: Write concise messages that match the repo style.
- **PRs**: Before opening a PR, verify:
  - `bun run lint` passes
  - `bun run typecheck` passes
  - `bun run build` succeeds
  - Manual test in browser (Chrome/Edge with WebGPU)

---

## 6. Troubleshooting & Tips

- **WebGPU not detected**: Ensure the browser supports WebGPU (Chrome 113+, Edge 113+). Check `caniuse.com/webgpu`.
- **Model loading failures**: Check network connectivity; models are fetched from Hugging Face / MLC CDN.
- **Service Worker conflicts**: Serwist handles caching. During development, unregister SW if assets feel stale.
- **Bun vs Node**: Some scripts or global types may assume Node. Prefer Bun-native APIs when possible.

---

## 7. Repository URLs

- **Source**: https://github.com/mlc-ai/web-llm-chat
- **Issues**: https://github.com/mlc-ai/web-llm-chat/issues
- **Deployed**: https://chat.webllm.ai

---

## 8. Updating This File

When project conventions change (new scripts, major dependency upgrades, routing shifts, build config changes), update this file accordingly. Treat it as the source of truth for agent behavior.
