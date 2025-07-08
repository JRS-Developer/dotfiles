local status_ok, which_key = pcall(require, "which-key")
if not status_ok then
	return
end

-- Reads the .vscode/launch.json file and loads it into dap
local continue = function()
	if vim.fn.filereadable(".vscode/launch.json") then
		require("dap.ext.vscode").load_launchjs(nil, { node = { "javascript", "node2" } })
	end
	require("dap").continue()
end

local opts = {
	mode = "n", -- NORMAL mode
	prefix = "<leader>", -- key prefix
	buffer = nil, -- Global mappings. Specify a buffer number for buffer local mappings
	silent = true, -- use `silent` when creating keymaps
	noremap = true, -- use `noremap` when creating keymaps
	nowait = true, -- use `nowait` when creating keymaps
}

local mappings = {
	{
		"<leader>S",
		"<cmd>lua require('spectre').open()<cr>",
		desc = "Search And Replace",
		nowait = true,
		remap = false,
	},
	{ "<leader>c", group = "BufferLine Close", nowait = true, remap = false },
	{ "<leader>cA", group = "Code AI", nowait = true, remap = false },
	{ "<leader>cA", "<cmd>CodeCompanion<cr>", desc = "Quick Chat", nowait = false, remap = false, mode = { "v" } },
	{ "<leader>cAo", "<cmd>CodeCompanionChat Toggle<cr>", desc = "Toggle Chat", nowait = true, remap = false },
	{ "<leader>cAn", "<cmd>CodeCompanionChat<cr>", desc = "New Chat", nowait = true, remap = false },
	{ "<leader>cl", "<cmd>BufferLineCloseLeft<cr>", desc = "Close Left", nowait = true, remap = false },
	{ "<leader>cr", "<cmd>BufferLineCloseRight<cr>", desc = "Close Right", nowait = true, remap = false },
	{ "<leader>d", group = "DAP", nowait = true, remap = false },
	{ "<leader>db", group = "Breakpoint", nowait = true, remap = false },
	{
		"<leader>dbc",
		':lua require("dap").set_breakpoint(vim.fn.input("Breakpoint condition: "))<CR>',
		desc = "Set conditional",
		nowait = true,
		remap = false,
	},
	{
		"<leader>dbl",
		':lua require("dap").set_breakpoint(nil, nil, vim.fn.input("Log point message: "))<CR>',
		desc = "With Log Point Message",
		nowait = true,
		remap = false,
	},
	{ "<leader>dbt", ':lua require("dap").toggle_breakpoint()<CR>', desc = "Toggle", nowait = true, remap = false },
	{ "<leader>dc", continue, desc = "Continue", nowait = true, remap = false },
	{ "<leader>dd", ':lua require("dap").repl.open()<CR>', desc = "Open Debug Console", nowait = true, remap = false },
	{
		"<leader>dl",
		':lua require("dap").run_last()<CR>',
		desc = "Run Last Debugging Config",
		nowait = true,
		remap = false,
	},
	{ "<leader>ds", group = "Step", nowait = true, remap = false },
	{ "<leader>dsO", ':lua require("dap").step_into()<CR>', desc = "Step Into", nowait = true, remap = false },
	{ "<leader>dsb", ':lua require("dap").step_back()<CR>', desc = "Step Back", nowait = true, remap = false },
	{ "<leader>dsc", ':lua require("dap").run_to_cursor()<CR>', desc = "Run To Cursor", nowait = true, remap = false },
	{ "<leader>dsi", ':lua require("dap").step_out()<CR>', desc = "Step Out", nowait = true, remap = false },
	{ "<leader>dso", ':lua require("dap").step_over()<CR>', desc = "Step Over", nowait = true, remap = false },
	{ "<leader>dt", ':lua require("dap").terminate()<CR>', desc = "Terminate", nowait = true, remap = false },
	{ "<leader>du", ':lua require("dapui").toggle()<CR>', desc = "Toggle UI", nowait = true, remap = false },
	{ "<leader>f", group = "File", nowait = true, remap = false },
	{ "<leader>fb", "<cmd>FzfLua buffers<cr>", desc = "Find Buffer", nowait = true, remap = false },
	{
		"<leader>ff",
		"<cmd>FzfLua files<cr>",
		desc = "Find File",
		nowait = true,
		remap = false,
	},
	{ "<leader>fg", "<cmd>FzfLua live_grep<cr>", desc = "Find Word", nowait = true, remap = false },
	{ "<leader>fh", "<cmd>FzfLua help_tags<cr>", desc = "Find Tag", nowait = true, remap = false },
	{ "<leader>m", group = "Markdown Preview", nowait = true, remap = false },
	{ "<leader>mo", "<cmd>MarkdownPreview<cr>", desc = "Open", nowait = true, remap = false },
	{ "<leader>ms", "<cmd>MarkdownPreviewStop<cr>", desc = "Stop", nowait = true, remap = false },
	{ "<leader>mt", "<cmd>MarkdownPreview<cr>", desc = "Toggle", nowait = true, remap = false },
	{ "<leader>nn", "<cmd>NvimTreeToggle <cr>", desc = "NvimTreeToggle", nowait = true, remap = false },
	{ "<leader>nr", "<cmd>NvimTreeRefresh <cr>", desc = "NvimTreeRefresh", nowait = true, remap = false },
	{ "<leader>p", group = "Lazy", nowait = true, remap = false },
	{ "<leader>pS", "<cmd>Lazy home<cr>", desc = "Status", nowait = true, remap = false },
	{ "<leader>ps", "<cmd>Lazy sync<cr>", desc = "Sync", nowait = true, remap = false },
	{ "<leader>pu", "<cmd>Lazy update<cr>", desc = "Update", nowait = true, remap = false },
	{
		"<leader>s",
		"<cmd>lua require('spectre').open_visual({select_word=true})<cr>",
		desc = "Search Replace Current Word",
		nowait = true,
		remap = false,
	},
	{ "<leader>t", "<cmd>ToggleTerm<cr>", desc = "ToggleTerm", nowait = true, remap = false },
	{ "<leader>x", group = "Trouble", nowait = true, remap = false },
	{
		"<leader>xd",
		"<cmd>Trouble document_diagnostics<cr>",
		desc = "Trouble Document Diagnostics",
		nowait = true,
		remap = false,
	},
	{ "<leader>xl", "<cmd>Trouble locklist<cr>", desc = "Trouble Locklist", nowait = true, remap = false },
	{ "<leader>xq", "<cmd>Trouble quickfix<cr>", desc = "Trouble Quickfix", nowait = true, remap = false },
	{ "<leader>xt", "<cmd>Trouble fzf<cr>", desc = "Trouble Fzf", nowait = true, remap = false },
	{
		"<leader>xw",
		"<cmd>Trouble workspace_diagnostics<cr>",
		desc = "Trouble Workspace Diagnostics",
		nowait = true,
		remap = false,
	},
	{ "<leader>xx", "<cmd>Trouble<cr>", desc = "Trouble", nowait = true, remap = false },

	{ "<leader>g", group = "Git", nowait = true, remap = false },
	{ "<leader>gg", "<cmd>lua _LAZYGIT_TOGGLE()<CR>", desc = "LazyGit", nowait = true, remap = false },
	{ "<leader>gb", "<cmd>Gitsigns blame<CR>", desc = "Git Blame", nowait = true, remap = false },
}

which_key.add(mappings, opts)
