local M = {}
-- NULL LS FUNCTIONS
local lsp_formatting = function(bufnr)
	vim.lsp.buf.format({
		filter = function(client)
			-- apply whatever logic you want (in this example, we'll only use null-ls)
			return client.name == "null-ls"
		end,
		bufnr = bufnr,
	})
end
-- if you want to set up formatting on save, you can use this as a callback
local augroup = vim.api.nvim_create_augroup("LspFormatting", {})

-- Use an on_attach function to only map the following keys
-- after the language server attaches to the current buffer
function M.on_attach(client, bufnr)
	vim.diagnostic.config({
		virtual_text = {
			prefix = "●", -- Could be '●', '▎', 'x'
		},
		signs = {
			text = {
				[vim.diagnostic.severity.ERROR] = " ",
				[vim.diagnostic.severity.WARN] = " ",
				[vim.diagnostic.severity.INFO] = "󰋼 ",
				[vim.diagnostic.severity.HINT] = "󰌵 ",
			},
			numhl = {
				[vim.diagnostic.severity.ERROR] = "",
				[vim.diagnostic.severity.WARN] = "",
				[vim.diagnostic.severity.HINT] = "",
				[vim.diagnostic.severity.INFO] = "",
			},
		},
		underline = true,
		-- update_in_insert = true, -- HIGH CPU USAGE
		update_in_insert = false,
	})

	-- NULL LS
	vim.api.nvim_clear_autocmds({ group = augroup, buffer = bufnr })

	-- Format on save
	vim.api.nvim_create_autocmd("BufWritePre", {
		group = augroup,
		buffer = bufnr,
		callback = function()
			lsp_formatting(bufnr)
		end,
	})
end

vim.api.nvim_set_hl(0, "PmenuSel", { bg = "#282C34", fg = "NONE" })
vim.api.nvim_set_hl(0, "Pmenu", { fg = "#C5CDD9", bg = "#22252A" })

vim.api.nvim_set_hl(0, "CmpItemAbbrDeprecated", { fg = "#7E8294", bg = "NONE", strikethrough = true })
vim.api.nvim_set_hl(0, "CmpItemAbbrMatch", { fg = "#82AAFF", bg = "NONE", bold = true })
vim.api.nvim_set_hl(0, "CmpItemAbbrMatchFuzzy", { fg = "#82AAFF", bg = "NONE", bold = true })
vim.api.nvim_set_hl(0, "CmpItemMenu", { fg = "#C792EA", bg = "NONE", italic = true })

vim.api.nvim_set_hl(0, "CmpItemKindField", { fg = "#EED8DA" })
vim.api.nvim_set_hl(0, "CmpItemKindProperty", { fg = "#EED8DA" })
vim.api.nvim_set_hl(0, "CmpItemKindEvent", { fg = "#EED8DA" })

vim.api.nvim_set_hl(0, "CmpItemKindText", { fg = "#C3E88D" })
vim.api.nvim_set_hl(0, "CmpItemKindEnum", { fg = "#C3E88D" })
vim.api.nvim_set_hl(0, "CmpItemKindKeyword", { fg = "#C3E88D" })

vim.api.nvim_set_hl(0, "CmpItemKindConstant", { fg = "#FFE082" })
vim.api.nvim_set_hl(0, "CmpItemKindConstructor", { fg = "#FFE082" })
vim.api.nvim_set_hl(0, "CmpItemKindReference", { fg = "#FFE082" })

vim.api.nvim_set_hl(0, "CmpItemKindFunction", { fg = "#EADFF0" })
vim.api.nvim_set_hl(0, "CmpItemKindStruct", { fg = "#EADFF0" })
vim.api.nvim_set_hl(0, "CmpItemKindClass", { fg = "#EADFF0" })
vim.api.nvim_set_hl(0, "CmpItemKindModule", { fg = "#EADFF0" })
vim.api.nvim_set_hl(0, "CmpItemKindOperator", { fg = "#EADFF0" })

vim.api.nvim_set_hl(0, "CmpItemKindVariable", { fg = "#C5CDD9" })
vim.api.nvim_set_hl(0, "CmpItemKindFile", { fg = "#C5CDD9" })

vim.api.nvim_set_hl(0, "CmpItemKindUnit", { fg = "#F5EBD9" })
vim.api.nvim_set_hl(0, "CmpItemKindSnippet", { fg = "#F5EBD9" })
vim.api.nvim_set_hl(0, "CmpItemKindFolder", { fg = "#F5EBD9" })

vim.api.nvim_set_hl(0, "CmpItemKindMethod", { fg = "#DDE5F5" })
vim.api.nvim_set_hl(0, "CmpItemKindValue", { fg = "#DDE5F5" })
vim.api.nvim_set_hl(0, "CmpItemKindEnumMember", { fg = "#DDE5F5" })

vim.api.nvim_set_hl(0, "CmpItemKindInterface", { fg = "#D8EEEB" })
vim.api.nvim_set_hl(0, "CmpItemKindColor", { fg = "#D8EEEB" })
vim.api.nvim_set_hl(0, "CmpItemKindTypeParameter", { fg = "#D8EEEB" })

M.capabilities = require("blink.cmp").get_lsp_capabilities()

-- Install the servers that are not installed yet.
local servers = {
	-- "tsserver",
	"vtsls",
	"vimls",
	"cssls",
	"html",
	-- "cssmodules_ls",
	-- "stylelint_lsp",
	"tailwindcss",
	-- "emmet_ls",
	"pyright",
	--[[ "gopls", ]]
	-- "golangci_lint_ls",
	-- "intelephense",
	-- "volar",
	"jsonls",
	"lua_ls",
	"astro",
}

require("mason").setup()
local masonLsp = require("mason-lspconfig")
local lspconfig = require("lspconfig")

masonLsp.setup({
	ensure_installed = servers,
	automatic_enable = false,
})

for _, name in pairs(masonLsp.get_installed_servers()) do
	local opts = {
		on_attach = M.on_attach,
		capabilities = M.capabilities,
	}

	if name == "tailwindcss" then
		opts.settings = {
			tailwindCSS = {
				experimental = {
					classRegex = {
						{ "cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]" },
					},
				},
			},
		}
	end

	if name == "lua_ls" then
		opts.settings = {
			Lua = {
				diagnostics = {
					globals = {
						vim = true,
						nvim = true,
					},
				},
			},
		}
	end

	if name == "stylelint_lsp" then
		opts.filetypes = {
			"css",
			"scss",
		}
		opts.root_dir = lspconfig.util.root_pattern("package.json", ".git")
	end

	if name == "graphql" then
		opts.filetypes = {
			"graphql",
			"typescriptreact",
			"javascriptreact",
			"typescript",
			"javascript",
		}
	end

	if name == "astro" then
		opts.init_options = {
			typescript = {
				tsdk = vim.fn.expand("~/.local/share/nvim/mason/packages/astro-language-server/node_modules/typescript/lib"),
			},
		}
	end

	if name == "jsonls" then
		opts.settings = {
			json = {
				schemas = require("schemastore").json.schemas(),
				format = {
					enable = true,
				},
				validate = {
					enable = true,
				},
			},
		}
	end

	vim.lsp.config(name, opts)
	vim.lsp.enable(name)
end

return M
