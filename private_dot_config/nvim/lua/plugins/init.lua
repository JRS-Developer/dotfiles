local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
	vim.fn.system({
		"git",
		"clone",
		"--filter=blob:none",
		"https://github.com/folke/lazy.nvim.git",
		"--branch=stable", -- latest stable release
		lazypath,
	})
end
vim.opt.rtp:prepend(lazypath)

local lazy = require("lazy")

local border_chars = { "╭", "─", "╮", "│", "╯", "─", "╰", "│" }

local notVsCodePlugins = {
	{
		"catppuccin/nvim",
		name = "catppuccin",
		priority = 1000,
		config = function()
			require("catppuccin-config")
		end,
	},

	{
		"HiPhish/rainbow-delimiters.nvim",
		config = function()
			require("rainbow-delimiters.setup").setup()
		end,
	},

	{
		"nvim-tree/nvim-web-devicons",
		config = function()
			require("devicons-config")
		end,
	},

	{
		"catgoose/nvim-colorizer.lua",
		config = function()
			require("colorizer-config")
		end,
	},

	{
		"folke/noice.nvim",
		event = "VeryLazy",
		opts = {
			-- add any options here
		},
		config = function()
			require("noice").setup({
				lsp = {
					-- override markdown rendering so that **cmp** and other plugins use **Treesitter**
					override = {
						["vim.lsp.util.convert_input_to_markdown_lines"] = true,
						["vim.lsp.util.stylize_markdown"] = true,
						["cmp.entry.get_documentation"] = true, -- requires hrsh7th/nvim-cmp
					},
					signature = {
						enabled = false,
					},
				},
				-- you can enable a preset for easier configuration
				presets = {
					bottom_search = false, -- use a classic bottom cmdline for search
					command_palette = false, -- position the cmdline and popupmenu together
					long_message_to_split = true, -- long messages will be sent to a split
					inc_rename = false, -- enables an input dialog for inc-rename.nvim
					lsp_doc_border = false, -- add a border to hover docs and signature help
				},
				views = {
					cmdline_popup = {
						border = {
							style = "none",
							padding = { 2, 3 },
						},
						filter_options = {},
						win_options = {
							winhighlight = "NormalFloat:NormalFloat,FloatBorder:FloatBorder",
						},
					},
				},
				routes = {
					{
						filter = {
							event = "lsp",
							kind = "progress",
							cond = function(message)
								local client = vim.tbl_get(message.opts, "progress", "client")
								return client == "null-ls"
							end,
						},
						opts = { skip = true },
					},
				},
			})
		end,
		dependencies = {
			-- if you lazy-load any plugin below, make sure to add proper `module="..."` entries
			"MunifTanjim/nui.nvim",
		},
	},

	{
		"lukas-reineke/indent-blankline.nvim",
		main = "ibl",
		config = function()
			require("indent-blankline-config")
		end,
	},
	{
		"kyazdani42/nvim-tree.lua",
		dependencies = {
			"nvim-tree/nvim-web-devicons", -- optional, for file icon
		},
		config = function()
			require("nvim-tree-config")
		end,
		cmd = { "NvimTreeToggle", "NvimTreeFocus" },
		ft = { "netrw" },
	},
	{
		"ibhagwan/fzf-lua",
		-- optional for icon support
		dependencies = { "nvim-tree/nvim-web-devicons" },
		-- or if using mini.icons/mini.nvim
		-- dependencies = { "echasnovski/mini.icons" },
		opts = {},
		config = function()
			require("fzf-lua").setup({
				"telescope",
				files = {
					no_ignore = true, -- respect ".gitignore"  by default
					fd_opts = [[--color=never --hidden --type f --type l --exclude .git --exclude dist --exclude node_modules --exclude .next]],
				},
				grep = {
					hidden = true,
					rg_opts = [[--column --line-number --no-heading --color=always --smart-case --max-columns=4096 --hidden --glob '!.git/*' --glob '!node_modules/*' --glob '!dist/*' --glob '!.next/*' -e]],
				},
			})
		end,
	},

	-- LSP
	{
		"williamboman/mason.nvim",
		config = function()
			require("lsp-config")
		end,
		dependencies = {
			"neovim/nvim-lspconfig",
			"saghen/blink.cmp",
			"williamboman/mason-lspconfig.nvim",
			"b0o/SchemaStore.nvim", -- Json schemas
		},
	},
	{
		"nvimdev/lspsaga.nvim",
		config = function()
			require("lsp-saga-config")
		end,
		event = "LspAttach",
		dependencies = {
			"nvim-treesitter/nvim-treesitter", -- optional
			"nvim-tree/nvim-web-devicons", -- optionalpl
		},
	},
	{
		"ray-x/lsp_signature.nvim",
		config = function()
			require("lsp_signature").setup({
				hint_prefix = "🐢 ",
			})
		end,
		dependencies = "mason-lspconfig.nvim",
	},
	{
		"folke/trouble.nvim",
		dependencies = "nvim-tree/nvim-web-devicons",
		config = function()
			require("trouble-config")
		end,
		cmd = "Trouble",
	},
	{
		"dmmulroy/ts-error-translator.nvim",
		config = function()
			require("ts-error-translator").setup()
		end,
	},

	-- Formatting, Diagnostics and Code Analysis, The best of both worlds!
	{
		"jay-babu/mason-null-ls.nvim",
		event = { "BufReadPre", "BufNewFile" },
		dependencies = {
			"williamboman/mason.nvim",
			"nvimtools/none-ls.nvim",
		},
		config = function()
			require("null-ls-config")
		end,
	},

	-- Mini, a bunch of stuff
	{
		"echasnovski/mini.nvim",
		version = "*",
		config = function()
			-- require("mini.icons").setup()
		end,
	},

	-- Completion
	{
		"saghen/blink.cmp",
		-- optional: provides snippets for the snippet source
		dependencies = {
			"rafamadriz/friendly-snippets",
			"onsails/lspkind-nvim",
			"fang2hou/blink-copilot",
			"Kaiser-Yang/blink-cmp-avante",
		},

		-- use a release tag to download pre-built binaries
		version = "*",
		-- AND/OR build from source, requires nightly: https://rust-lang.github.io/rustup/concepts/channels.html#working-with-nightly-rust
		-- build = 'cargo build --release',
		-- If you use nix, you can build from source using latest nightly rust with:
		-- build = 'nix run .#build-plugin',

		---@module 'blink.cmp'
		---@type blink.cmp.Config
		opts = {
			-- 'default' (recommended) for mappings similar to built-in completions (C-y to accept, C-n/C-p for up/down)
			-- 'super-tab' for mappings similar to vscode (tab to accept, arrow keys for up/down)
			-- 'enter' for mappings similar to 'super-tab' but with 'enter' to accept
			--
			-- All presets have the following mappings:
			-- C-space: Open menu or open docs if already open
			-- C-e: Hide menu
			-- C-k: Toggle signature help
			--
			-- See the full "keymap" documentation for information on defining your own keymap.
			keymap = {
				preset = "enter",
				["<Tab>"] = {
					"select_next",
					"fallback",
				},
				["<S-Tab>"] = { "select_prev", "fallback" },
			},

			appearance = {
				-- Sets the fallback highlight groups to nvim-cmp's highlight groups
				-- Useful for when your theme doesn't support blink.cmp
				-- Will be removed in a future release
				use_nvim_cmp_as_default = false,
				-- Set to 'mono' for 'Nerd Font Mono' or 'normal' for 'Nerd Font'
				-- Adjusts spacing to ensure icons are aligned
				nerd_font_variant = "normal",
			},

			-- Default list of enabled providers defined so that you can extend it
			-- elsewhere in your config, without redefining it, due to `opts_extend`
			sources = {
				default = { "avante", "copilot", "lsp", "path", "snippets", "buffer" },
				providers = {
					avante = {
						module = "blink-cmp-avante",
						name = "Avante",
						opts = {
							-- options for blink-cmp-avante
						},
					},
					copilot = {
						name = "copilot",
						module = "blink-copilot",
						score_offset = 100,
						async = true,
						opts = {
							-- options for blink-copilot
						},
					},
				},
			},
			snippets = { preset = "luasnip" },

			signature = { window = { border = border_chars } },

			cmdline = {
				completion = { ghost_text = { enabled = false } },
			},

			completion = {
				-- 'prefix' will fuzzy match on the text before the cursor
				-- 'full' will fuzzy match on the text before _and_ after the cursor
				-- example: 'foo_|_bar' will match 'foo_' for 'prefix' and 'foo__bar' for 'full'
				keyword = { range = "full" },

				-- Don't select by default, auto insert on selection
				list = { selection = { preselect = false, auto_insert = true } },

				documentation = { window = { border = border_chars } },

				menu = {
					border = border_chars,
					draw = {
						components = {
							kind_icon = {
								ellipsis = false,
								text = function(ctx)
									local icon = ctx.kind_icon
									if vim.tbl_contains({ "Path" }, ctx.source_name) then
										local dev_icon, _ = require("nvim-web-devicons").get_icon(ctx.label)
										if dev_icon then
											icon = dev_icon
										end
									elseif ctx.source_name == "copilot" then
										icon = ""
									end

									return icon .. ctx.icon_gap
								end,

								-- Optionally, use the highlight groups from nvim-web-devicons
								-- You can also add the same function for `kind.highlight` if you want to
								-- keep the highlight groups in sync with the icons.
								highlight = function(ctx)
									local hl = ctx.kind_hl
									if vim.tbl_contains({ "Path" }, ctx.source_name) then
										local dev_icon, dev_hl = require("nvim-web-devicons").get_icon(ctx.label)
										if dev_icon then
											hl = dev_hl
										end
									end
									return hl
								end,
							},
						},
					},
				},
			},

			-- Blink.cmp uses a Rust fuzzy matcher by default for typo resistance and significantly better performance
			-- You may use a lua implementation instead by using `implementation = "lua"` or fallback to the lua implementation,
			-- when the Rust fuzzy matcher is not available, by using `implementation = "prefer_rust"`
			--
			-- See the fuzzy documentation for more information
			fuzzy = { implementation = "prefer_rust_with_warning" },
		},
		opts_extend = { "sources.default" },
	},

	-- Snippets
	{
		"L3MON4D3/LuaSnip",
		version = "v2.*",
		config = function()
			require("luaSnip-config")
		end,
		build = "make install_jsregexp",
		dependencies = { "rafamadriz/friendly-snippets" },
	},

	"rafamadriz/friendly-snippets",

	{
		"windwp/nvim-autopairs",
		event = "InsertEnter",
		config = function()
			require("nvim-autopairs").setup({
				check_ts = true,
			})
		end,
	},
	-- Tabs
	{
		"akinsho/bufferline.nvim",
		dependencies = "nvim-tree/nvim-web-devicons",
		after = "catppuccin",
		config = function()
			require("bufferline-config")
		end,
	},

	-- Comments
	{
		"numToStr/Comment.nvim",
		-- keys = { -- example keymaps for lazy loading this plugin.
		-- 	{ "gcc", mode = "n", desc = "Toggles the current line using linewise comment" },
		-- 	{ "gbc", mode = "n", desc = "Toggles the current line using blockwise comment" },
		-- 	{ "gc", mode = "v", desc = "Toggles the region using linewise comment" },
		-- 	{ "gb", mode = "v", desc = "Toggles the region using blockwise comment" },
		-- },
		config = function()
			require("Comment-config")
		end,
	},

	{
		"folke/todo-comments.nvim",
		config = function()
			require("todo-comments").setup()
		end,
	},

	-- Lualine
	{
		"nvim-lualine/lualine.nvim",
		dependencies = {
			"AndreM222/copilot-lualine",
		},
		config = function()
			require("lualine-config")
		end,
	},

	-- Git
	{
		"lewis6991/gitsigns.nvim",
		dependencies = {
			"nvim-lua/plenary.nvim",
		},
		config = function()
			require("gitsigns-config")
		end,
	},

	{ "tpope/vim-fugitive" },

	-- Markdown
	{
		"iamcco/markdown-preview.nvim",
		build = "cd app && npm install",
		config = function()
			vim.g.mkdp_filetypes = { "markdown" }
		end,
		ft = { "markdown" },
	},

	-- Cursor
	{
		"RRethy/vim-illuminate",
		config = function()
			require("illuminate").configure({})
		end,
	},

	-- MML (Ai Agents)
	{
		"yetone/avante.nvim",
		enabled = false,
		-- if you want to build from source then do `make BUILD_FROM_SOURCE=true`
		-- ⚠️ must add this setting! ! !
		build = vim.fn.has("win32") ~= 0
				and "powershell -ExecutionPolicy Bypass -File Build.ps1 -BuildFromSource false"
			or "make",
		event = "VeryLazy",
		version = false, -- Never set this value to "*"! Never!
		---@module 'avante'
		---@type avante.Config
		opts = {
			-- add any opts here
			-- for example
			-- provider = "claude",
			-- providers = {
			--   claude = {
			--     endpoint = "https://api.anthropic.com",
			--     model = "claude-sonnet-4-20250514",
			--     timeout = 30000, -- Timeout in milliseconds
			--       extra_request_body = {
			--         temperature = 0.75,
			--         max_tokens = 20480,
			--       },
			--   },
			--   moonshot = {
			--     endpoint = "https://api.moonshot.ai/v1",
			--     model = "kimi-k2-0711-preview",
			--     timeout = 30000, -- Timeout in milliseconds
			--     extra_request_body = {
			--       temperature = 0.75,
			--       max_tokens = 32768,
			--     },
			--   },
			-- },
			mode = "agentic",
			provider = "copilot",
			providers = {
				-- openrouter = {
				-- 	__inherited_from = "openai",
				-- 	endpoint = "https://openrouter.ai/api/v1",
				-- 	api_key_name = "OPENROUTER_API_KEY",
				-- 	model = "deepseek/deepseek-chat-v3-0324",
				-- 	-- disable_tools = true, -- disable tools!
				-- 	extra_request_body = {
				-- 		-- models = {
				-- 		-- 	"qwen/qwen3-coder:free",
				-- 		-- 	"meta-llama/llama-3.3-70b-instruct:free",
				-- 		-- },
				-- 		transforms = { "middle‑out" },
				-- 	},
				-- },
				-- ollama = {
				-- 	endpoint = "http://localhost:11434",
				-- 	model = "qwen2.5-coder:3b",
				-- 	extra_request_body = {
				-- 		-- options = { num_ctx = 4096 },
				-- 		-- optionally: temperature, keep_alive, etc.
				-- 	},
				-- },
				copilot = {
					model = "gpt-4.1",
					use_response_api = false,
				},
			},
			behaviour = {
				auto_approve_tool_permissions = false, -- Default: show permission prompts for all tools
			},
			selector = {
				--- @alias avante.SelectorProvider "native" | "fzf_lua" | "mini_pick" | "snacks" | "telescope" | fun(selector: avante.ui.Selector): nil
				--- @type avante.SelectorProvider
				provider = "fzf_lua",
				-- Options override for custom providers
				provider_opts = {},
			},
			input = {
				provider = "snacks",
				provider_opts = {
					-- Additional snacks.input options
					title = "Avante Input",
					icon = " ",
				},
			},
		},
		dependencies = {
			"nvim-lua/plenary.nvim",
			"MunifTanjim/nui.nvim",
			"folke/snacks.nvim", -- for input provider snacks
			{
				-- support for image pasting
				"HakonHarnes/img-clip.nvim",
				event = "VeryLazy",
				opts = {
					-- recommended settings
					default = {
						embed_image_as_base64 = false,
						prompt_for_file_name = false,
						drag_and_drop = {
							insert_mode = true,
						},
						-- required for Windows users
						use_absolute_path = true,
					},
				},
			},
			{
				-- Make sure to set this up properly if you have lazy=true
				"MeanderingProgrammer/render-markdown.nvim",
				opts = {
					file_types = { "markdown", "Avante" },
				},
				ft = { "markdown", "Avante" },
			},
		},
	},
	{
		"zbirenbaum/copilot.lua",
		cmd = "Copilot",
		event = "InsertEnter",
		dependencies = {
			"copilotlsp-nvim/copilot-lsp", -- (optional) for NES functionality
		},
		opts = {
			suggestion = { enabled = false },
			panel = { enabled = false },
			filetypes = {
				markdown = true,
				help = true,
			},
		},
	},

	-- Search And Replace
	"windwp/nvim-spectre",

	-- Debugger
	{
		"mfussenegger/nvim-dap",
		config = function()
			require("dap-config")
		end,
	},

	{
		"rcarriga/nvim-dap-ui",
		dependencies = { "mfussenegger/nvim-dap", "nvim-neotest/nvim-nio" },
		config = function()
			require("dapui").setup()
		end,
	},

	{
		"theHamsta/nvim-dap-virtual-text",
		config = function()
			require("nvim-dap-virtual-text").setup()
		end,
		dependencies = "nvim-dap",
	},

	-- Keymaps
	{
		"folke/which-key.nvim",
		config = function()
			require("which-key-config")
		end,
	},

	{
		"kdheepak/lazygit.nvim",
		lazy = false,
		cmd = {
			"LazyGit",
			"LazyGitConfig",
			"LazyGitCurrentFile",
			"LazyGitFilter",
			"LazyGitFilterCurrentFile",
		},
		-- optional for floating window border decoration
		dependencies = {
			"nvim-lua/plenary.nvim",
		},
	},
	{
		"christoomey/vim-tmux-navigator",
		cmd = {
			"TmuxNavigateLeft",
			"TmuxNavigateDown",
			"TmuxNavigateUp",
			"TmuxNavigateRight",
			"TmuxNavigatePrevious",
		},
		keys = {
			{ "<c-h>", "<cmd><C-U>TmuxNavigateLeft<cr>" },
			{ "<c-j>", "<cmd><C-U>TmuxNavigateDown<cr>" },
			{ "<c-k>", "<cmd><C-U>TmuxNavigateUp<cr>" },
			{ "<c-l>", "<cmd><C-U>TmuxNavigateRight<cr>" },
			{ "<c-\\>", "<cmd><C-U>TmuxNavigatePrevious<cr>" },
		},
	},

	{
		"sindrets/diffview.nvim",
	},

	{ "wakatime/vim-wakatime", lazy = false },
}

local commonPlugins = {

	-- Sintax
	{
		"nvim-treesitter/nvim-treesitter",
		build = ":TSUpdate",
		lazy = false,
		dependencies = {
			"windwp/nvim-ts-autotag",
			"JoosepAlviste/nvim-ts-context-commentstring",
		},
		config = function()
			require("treesitter-config")
		end,
	},
	{
		"nvim-treesitter/nvim-treesitter-textobjects",
		after = "nvim-treesitter",
		dependencies = {
			"nvim-treesitter/nvim-treesitter",
		},
	},

	{
		"kylechui/nvim-surround",
		version = "*", -- Use for stability; omit to use `main` branch for the latest features
		config = function()
			require("nvim-surround").setup({})
		end,
	},

	"tpope/vim-repeat",

	-- Motion
	{
		"folke/flash.nvim",
		event = "VeryLazy",
		opts = {
			modes = {
				char = {
					jump_labels = true,
				},
			},
		},
		keys = {
			{
				"s",
				mode = { "n", "o" },
				function()
					require("flash").jump({
						search = { -- Match beginning of words only
							mode = function(str)
								return "\\<" .. str
							end,
						},
					})
				end,
				desc = "Flash",
			},
			{
				"S",
				mode = { "n", "o" },
				function()
					require("flash").treesitter()
				end,
				desc = "Flash Treesitter",
			},
			{
				"r",
				mode = "o",
				function()
					require("flash").remote()
				end,
				desc = "Remote Flash",
			},
			{
				"R",
				mode = { "o", "x" },
				function()
					require("flash").treesitter_search()
				end,
				desc = "Flash Treesitter Search",
			},
			{
				"<c-s>",
				mode = { "c" },
				function()
					require("flash").toggle()
				end,
				desc = "Toggle Flash Search",
			},
		},
	},
}

local onlyVscodePlugins = {}

local is_vscode = vim.g.vscode ~= nil

local plugins = commonPlugins
if not is_vscode then
	for _, plugin in ipairs(notVsCodePlugins) do
		table.insert(plugins, plugin)
	end
end

if is_vscode then
	for _, plugin in ipairs(onlyVscodePlugins) do
		table.insert(plugins, plugin)
	end
end

lazy.setup(plugins)
