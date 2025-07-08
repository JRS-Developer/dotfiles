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
		signs = true,
		underline = true,
		-- update_in_insert = true, -- HIGH CPU USAGE
		update_in_insert = false,
	})

	local signs = { Error = "", Warn = "", Hint = "󰌶", Info = "" }

	for type, icon in pairs(signs) do
		local hl = "DiagnosticSign" .. type
		vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = hl })
	end

	-- NULL LS
	vim.api.nvim_clear_autocmds({ group = augroup, buffer = bufnr })
	vim.api.nvim_create_autocmd("BufWritePre", {
		group = augroup,
		buffer = bufnr,
		callback = function()
			lsp_formatting(bufnr)
		end,
	})
end

local has_words_before = function()
	if vim.api.nvim_buf_get_option(0, "buftype") == "prompt" then
		return false
	end
	local line, col = unpack(vim.api.nvim_win_get_cursor(0))
	return col ~= 0 and vim.api.nvim_buf_get_text(0, line - 1, 0, line - 1, col, {})[1]:match("^%s*$") == nil
end

-- local cmp = require("cmp")
-- local luasnip = require("luasnip")
-- local lspkind = require("lspkind")
-- If you want insert `(` after select function or method item
-- local cmp_autopairs = require("nvim-autopairs.completion.cmp")
-- cmp.event:on("confirm_done", cmp_autopairs.on_confirm_done())

-- cmp.setup({
-- 	snippet = {
-- 		-- REQUIRED - you must specify a snippet engine
-- 		expand = function(args)
-- 			require("luasnip").lsp_expand(args.body) -- For `luasnip` users.
-- 		end,
-- 	},
-- 	window = {
-- 		completion = cmp.config.window.bordered(),
--
-- 		documentation = cmp.config.window.bordered(),
-- 	},
--
-- 	-- formatting = {
-- 	-- 	format = lspkind.cmp_format({
-- 	-- 		mode = "symbol", -- show only symbol annotations
-- 	-- 		maxwidth = 50, -- prevent the popup from showing more than provided characters (e.g 50 will not show more than 50 characters)
-- 	-- 		symbol_map = { Copilot = "" }, -- Add copilot icon
-- 	-- 	}),
-- 	-- },
-- 	formatting = {
-- 		fields = { "kind", "abbr", "menu" },
-- 		format = function(entry, vim_item)
-- 			local kind = lspkind.cmp_format({
-- 				mode = "symbol_text",
-- 				maxwidth = 50,
-- 				symbol_map = { Copilot = "" },
-- 			})(entry, vim_item)
-- 			local strings = vim.split(kind.kind, "%s", { trimempty = true })
-- 			kind.kind = " " .. (strings[1] or "") .. " "
-- 			kind.menu = "    (" .. (strings[2] or "") .. ")"
--
-- 			return kind
-- 		end,
-- 	},
-- 	mapping = cmp.mapping.preset.insert({
-- 		["<C-b>"] = cmp.mapping.scroll_docs(-4),
-- 		["<C-f>"] = cmp.mapping.scroll_docs(4),
-- 		["<C-Space>"] = cmp.mapping.complete(),
-- 		["<C-e>"] = cmp.mapping.abort(),
-- 		["<CR>"] = cmp.mapping.confirm(), -- Accept currently selected item. Set `select` to `false` to only confirm explicitly selected items.
-- 		["<Tab>"] = cmp.mapping(function(fallback)
-- 			if cmp.visible() and has_words_before() then
-- 				cmp.select_next_item({ behavior = cmp.SelectBehavior.Select })
-- 			elseif luasnip.expand_or_jumpable() then
-- 				luasnip.expand_or_jump()
-- 			else
-- 				fallback()
-- 			end
-- 		end, { "i", "s" }),
--
-- 		["<S-Tab>"] = cmp.mapping(function(fallback)
-- 			if cmp.visible() then
-- 				cmp.select_prev_item()
-- 			elseif luasnip.jumpable(0) then
-- 				luasnip.jump(-1)
-- 			else
-- 				fallback()
-- 			end
-- 		end, { "i", "s" }),
-- 	}),
-- 	sources = cmp.config.sources({
-- 		{ name = "copilot" },
-- 		{ name = "nvim_lsp" },
-- 		{ name = "luasnip" }, -- For luasnip users.
-- 		{ name = "buffer" },
-- 	}),
--
-- 	-- sorting for copilot
-- 	-- https://github.com/zbirenbaum/copilot-cmp#comparators
-- 	sorting = {
-- 		priority_weight = 2,
-- 		comparators = {
-- 			-- require("copilot_cmp.comparators").prioritize,
-- 			-- require("copilot_cmp.comparators").score,
--
-- 			-- Below is the default comparitor list and order for nvim-cmp
-- 			cmp.config.compare.offset,
-- 			-- cmp.config.compare.scopes, --this is commented in nvim-cmp too
-- 			cmp.config.compare.exact,
-- 			cmp.config.compare.score,
-- 			cmp.config.compare.recently_used,
-- 			cmp.config.compare.locality,
-- 			cmp.config.compare.kind,
-- 			cmp.config.compare.sort_text,
-- 			cmp.config.compare.length,
-- 			cmp.config.compare.order,
-- 		},
-- 	},
-- })
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

-- Set configuration for specific filetype.
-- cmp.setup.filetype("gitcommit", {
-- 	sources = cmp.config.sources({
-- 		{ name = "cmp_git" }, -- You can specify the `cmp_git` source if you were installed it.
-- 	}, {
-- 		{ name = "buffer" },
-- 	}),
-- })
--
-- -- Use buffer source for `/` (if you enabled `native_menu`, this won't work anymore).
-- cmp.setup.cmdline("/", {
-- 	mapping = cmp.mapping.preset.cmdline(),
-- 	sources = {
-- 		{ name = "buffer" },
-- 	},
-- })
--
-- -- Use cmdline & path source for ':' (if you enabled `native_menu`, this won't work anymore).
-- cmp.setup.cmdline(":", {
-- 	mapping = cmp.mapping.preset.cmdline(),
-- 	sources = cmp.config.sources({
-- 		{ name = "path" },
-- 	}, {
-- 		{ name = "cmdline" },
-- 	}),
-- })

-- M.capabilities = require("cmp_nvim_lsp").default_capabilities()
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
}

require("mason").setup()
local masonLsp = require("mason-lspconfig")
local lspconfig = require("lspconfig")

masonLsp.setup({
	ensure_installed = servers,
  automatic_enable = false
})

for _, name in pairs(masonLsp.get_installed_servers()) do
	local opts = {}

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

	-- if name == "vtsls" then
	-- 	opts.settings = {
	-- 		typescript = {
	-- 			tsserver = {
	-- 				maxTsServerMemory = ...,
	-- 			},
	-- 		},
	-- 	}
	-- end

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

	opts.on_attach = M.on_attach
	opts.capabilities = M.capabilities
	opts.root_dir = vim.loop.cwd

	lspconfig[name].setup(opts)
end

return M
