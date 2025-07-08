-- configure it
require("catppuccin").setup({
	dim_inactive = {
		enabled = false,
		shade = "dark",
		percentage = 0.15,
	},
	flavour = "mocha", -- latte, frappe, macchiato, mocha
	transparent_background = false,
	term_colors = true,
	compile = {
		enabled = true,
		path = vim.fn.stdpath("cache") .. "/catppuccin",
	},
	styles = {
		comments = { "italic" },
		conditionals = { "italic" },
		loops = {},
		functions = {},
		keywords = {},
		strings = {},
		variables = {},
		numbers = {},
		booleans = {},
		properties = {},
		types = {},
		operators = {},
	},
	integrations = {
		lsp_saga = true,
		neogit = true,
		telescope = true,
		cmp = false,
		mason = true,
		markdown = true,
		gitsigns = true,
		dashboard = true,
		nvimtree = true,
		treesitter = true,
		which_key = true,
		illuminate = true,
		dap = {
			enabled = false,
			enable_ui = false,
		},
		blink_cmp = true,
		rainbow_delimiters = true,
		indent_blankline = {
			enabled = true,
			colored_indent_levels = true,
		},
		native_lsp = {
			enabled = true,
			virtual_text = {
				errors = { "italic" },
				hints = { "italic" },
				warnings = { "italic" },
				information = { "italic" },
			},
			underlines = {
				errors = { "underline" },
				hints = { "underline" },
				warnings = { "underline" },
				information = { "underline" },
			},
		},
	},
})
vim.api.nvim_command("colorscheme catppuccin")
