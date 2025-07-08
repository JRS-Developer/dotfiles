require("nvim-treesitter.configs").setup({
	ensure_installed = "all",

	ignore_install = { "ipkg" },

	highlight = {
		-- `false` will disable the whole extension
		enable = true,

		-- Setting this to true will run `:h syntax` and tree-sitter at the same time.
		-- Set this to `true` if you depend on 'syntax' being enabled (like for indentation).
		-- Using this option may slow down your editor, and you may see some duplicate highlights.
		-- Instead of true it can also be a list of languages
		additional_vim_regex_highlighting = false,
	},
	indent = {
		enable = true,
	},
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
