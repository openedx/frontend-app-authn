TURBO = TURBO_TELEMETRY_DISABLED=1 turbo --dangerously-disable-package-manager-check

intl_imports = ./node_modules/.bin/intl-imports.js
transifex_utils = ./node_modules/.bin/transifex-utils.js
i18n = ./src/i18n
transifex_input = $(i18n)/transifex_input.json

# This directory must match .babelrc .
transifex_temp = ./temp/babel-plugin-formatjs

precommit:
	npm run lint
	npm audit

requirements:
	npm ci

# turbo.site.json is the standalone turbo config for this package.  It is
# renamed to avoid conflicts with turbo v2's workspace validation, which
# rejects root task syntax (//#) and requires "extends" in package-level
# turbo.json files, such as when running in a site repository. The targets
# below copy it into place before running turbo and clean up after.
turbo.json: turbo.site.json
	cp $< $@

build-packages: turbo.json
	$(TURBO) run build; rm -f turbo.json

clean-packages: turbo.json
	$(TURBO) run clean; rm -f turbo.json

dev-packages: turbo.json
	$(TURBO) run watch:build dev:site; rm -f turbo.json

clean:
	rm -rf dist

build:
	tsc --project tsconfig.build.json
	tsc-alias -p tsconfig.build.json
	find src -type f -name '*.scss' -exec sh -c '\
	  for f in "$$@"; do \
	    d="dist/$${f#src/}"; \
	    mkdir -p "$$(dirname "$$d")"; \
	    cp "$$f" "$$d"; \
	  done' sh {} +

i18n.extract:
	# Pulling display strings from .jsx files into .json files...
	rm -rf $(transifex_temp)
	npm run-script i18n_extract

i18n.concat:
	# Gathering JSON messages into one file...
	$(transifex_utils) $(transifex_temp) $(transifex_input)

extract_translations: | requirements i18n.extract i18n.concat

# Despite the name, we actually need this target to detect changes in the incoming translated message files as well.
detect_changed_source_translations:
	# Checking for changed translations...
	git diff --exit-code $(i18n)

pull_translations:
	rm -rf src/i18n/messages
	mkdir src/i18n/messages
	cd src/i18n/messages \
	  && atlas pull $(ATLAS_OPTIONS) \
	           translations/paragon/src/i18n/messages:paragon \
	           translations/frontend-platform/src/i18n/messages:frontend-platform \
	           translations/frontend-app-authn/src/i18n/messages:frontend-app-authn

	$(intl_imports) paragon frontend-platform frontend-app-authn

# This target is used by Travis.
validate-no-uncommitted-package-lock-changes:
	# Checking for package-lock.json changes...
	git diff --exit-code package-lock.json

.PHONY: validate
validate:
	make validate-no-uncommitted-package-lock-changes
	npm run i18n_extract
	npm run lint -- --max-warnings 0
	npm run test
	npm run build

.PHONY: validate.ci
validate.ci:
	npm ci
	make validate
