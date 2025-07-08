local null_ls = require("null-ls")
local builtins = null_ls.builtins

local sources = {
	-- Formatters
	builtins.formatting.stylua, --Lua
	builtins.formatting.black, --Python
	builtins.formatting.gofmt, --Go
	builtins.formatting.prettierd.with({
		prefer_local = "node_modules/.bin",
		extra_filetypes = { "prisma" },
	}),
	builtins.formatting.phpcbf, -- Php Code Sniffer Formatter
	builtins.formatting.phpcsfixer, -- Php Code Sniffer Formatter (PHP-CS-Fixer)
	builtins.formatting.clang_format,
	null_ls.builtins.formatting.dart_format,

	-- Diagnostics
	builtins.diagnostics.phpcs, -- Php Code Sniffer Linter
	builtins.diagnostics.phpmd.with({
		extra_args = { "phpmd.xml" },
	}), -- Php Mess Detector
	-- builtins.diagnostics.pylama, -- Python linter, useful?
	builtins.diagnostics.actionlint,
	-- builtins.diagnostics.cpplint,
	builtins.diagnostics.hadolint,

	-- Code Actions
	builtins.code_actions.gitsigns,
	-- require("typescript.extensions.null-ls.code-actions"),
}

null_ls.setup({
	sources = sources,
})

require("mason-null-ls").setup({
	ensure_installed = nil,
	automatic_installation = true,
})
