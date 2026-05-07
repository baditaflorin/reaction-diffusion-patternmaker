.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview hooks-pre-commit hooks-commit-msg hooks-pre-push clean

help:
	@printf "%s\n" \
		"make install-hooks     Wire local git hooks" \
		"make dev               Run the frontend dev server" \
		"make build             Build GitHub Pages output into docs/" \
		"make test              Run unit tests" \
		"make test-integration  Report Mode A integration status" \
		"make smoke             Serve docs/ and run Playwright smoke" \
		"make lint              Run formatter check, ESLint, and TypeScript" \
		"make fmt               Autoformat files" \
		"make pages-preview     Serve docs/ exactly as Pages would" \
		"make clean             Remove generated Pages assets and reports"

install-hooks:
	git config core.hooksPath .githooks

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-integration:
	@printf "%s\n" "Mode A has no separate integration suite; run make smoke for browser coverage."

smoke:
	npm run smoke

lint:
	npm run fmt:check
	npm run lint
	npm run typecheck

fmt:
	npm run fmt

pages-preview:
	npm run preview:pages

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	@printf "%s\n" "feat: validate hooks" > /tmp/reaction-diffusion-commit-msg
	.githooks/commit-msg /tmp/reaction-diffusion-commit-msg
	@rm -f /tmp/reaction-diffusion-commit-msg

hooks-pre-push:
	.githooks/pre-push

clean:
	rm -rf docs/assets docs/index.html docs/404.html docs/icon.svg docs/manifest.webmanifest docs/sw.js coverage playwright-report test-results
