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
	builtins.formatting.clang_format,
	builtins.formatting.pint,
	builtins.formatting.dart_format,
	builtins.formatting.blade_formatter,

	-- Diagnostics
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
