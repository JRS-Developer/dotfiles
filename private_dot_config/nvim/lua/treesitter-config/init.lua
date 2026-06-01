local treesitter = require("nvim-treesitter")

treesitter.setup({
	-- Directory to install parsers and queries to (prepended to `runtimepath` to have priority)
	install_dir = vim.fn.stdpath("data") .. "/site",
})

local languages = {
	-- Core web languages
	"javascript",
	"typescript",
	"tsx",
	"html",
	"css",
	"scss",
	"graphql",

	-- Frameworks / templating
	"vue",
	"svelte",
	"astro",
	"php",
	"php_only",
	"twig",

	-- Data / config formats
	"json",
	"yaml",
	"toml",
	"xml",
	"http",

	-- Documentation / markup
	"markdown",
	"markdown_inline",
	"jsdoc",
	"comment",

	-- Shell / infra
	"bash",
	"dockerfile",
	"nginx",
	"sql",
	"regex",
	"prisma",

	-- Other backend / tooling
	"lua",
	"rust",
	"go",
	"python",

	-- Git
	"git_config",
	"gitcommit",
	"gitignore",
	"diff",
}
treesitter.install(languages)

vim.api.nvim_create_autocmd("FileType", {
	pattern = "*",
	callback = function()
		pcall(vim.treesitter.start)
	end,
})

require("nvim-ts-autotag").setup({
	opts = {
		-- Defaults
		enable_close = true, -- Auto close tags
		enable_rename = true, -- Auto rename pairs of tags
		enable_close_on_slash = false, -- Auto close on trailing </
	},
})

require("ts_context_commentstring").setup({
	enable_autocmd = false,
})

-- Set vim.g.skip_ts_context_commentstring_module = true somewhere in your configuration to skip backwards compatibility routines and speed up loading.
vim.g.skip_ts_context_commentstring_module = true
