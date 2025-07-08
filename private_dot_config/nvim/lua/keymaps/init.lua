-- Shorten function name
local keymap = vim.keymap.set
-- Silent keymap option
local opts = { silent = true }

--Remap space as leader key
keymap("", "<Space>", "<Nop>", opts)
vim.g.mapleader = " "

-- Modes
--   normal_mode = "n",
--   insert_mode = "i",
--   visual_mode = "v",
--   visual_block_mode = "x",
--   term_mode = "t",
--   command_mode = "c",

-- Normal --
-- Better window navigation
keymap("n", "<C-h>", "<C-w>h", opts)
keymap("n", "<C-j>", "<C-w>j", opts)
keymap("n", "<C-k>", "<C-w>k", opts)
keymap("n", "<C-l>", "<C-w>l", opts)

-- Resize with arrows
keymap("n", "<C-Up>", ":resize -2<CR>", opts)
keymap("n", "<C-Down>", ":resize +2<CR>", opts)
keymap("n", "<C-Left>", ":vertical resize -2<CR>", opts)
keymap("n", "<C-Right>", ":vertical resize +2<CR>", opts)

-- Navigate buffers
-- keymap("n", "<S-l>", ":bnext<CR>", opts)
-- keymap("n", "<S-h>", ":bprevious<CR>", opts)

-- Clear highlights
keymap("n", "<leader>h", "<cmd>nohlsearch<CR>", opts)

-- Close buffers
-- keymap("n", "<S-q>", "<cmd>Bdelete!<CR>", opts)

-- Better paste
keymap("v", "p", '"_dP', opts)

-- Insert --
-- Press jk fast to enter
keymap("i", "jk", "<ESC>", opts)

-- Visual --
-- Stay in indent mode
keymap("v", "<", "<gv", opts)
keymap("v", ">", ">gv", opts)

-- VSCODE

if vim.g.vscode then
	local vscode = require("vscode")

	keymap("n", "<leader>ca", function()
		vscode.action("editor.action.quickFix")
	end, { silent = true })

	keymap("n", "<leader>ff", function()
		vscode.action("workbench.action.quickOpen")
	end, { silent = true })

	keymap("n", "<leader>cr", function()
		vscode.action("workbench.action.closeEditorsToTheRight")
	end, { silent = true })

	keymap("n", "<leader>cl", function()
		vscode.action("workbench.action.closeEditorsToTheLeft")
	end, { silent = true })

	keymap("n", "<leader>n", function()
		vscode.action("workbench.view.explorer")
	end, { silent = true })

	keymap("n", "gd", function()
		vscode.action("editor.action.peekDefinition")
	end, { silent = true })

	keymap("n", "gr", function()
		vscode.action("editor.action.rename")
	end, { silent = true })

	keymap("n", "gh", function()
		vscode.action("editor.action.referenceSearch.trigger")
	end, { silent = true })

	keymap("n", "gh", function()
		vscode.action("editor.action.referenceSearch.trigger")
	end, { silent = true })

	keymap("n", "<leader>fg", function()
		vscode.action("workbench.action.quickTextSearch")
	end, { silent = true })

	keymap("n", "<leader>fg", function()
		vscode.action("workbench.action.quickTextSearch")
	end, { silent = true })

	keymap("n", "<leader>ff", function()
		vscode.action("workbench.action.quickOpen")
	end, { silent = true })

	keymap("n", "[e", function()
		vscode.action("editor.action.marker.next")
	end, { silent = true })

	keymap("n", "]e", function()
		vscode.action("editor.action.marker.prev")
	end, { silent = true })

	keymap("n", "<leader>gg", function()
		vscode.action("lazygit-vscode.toggle")
	end, { silent = true })

	keymap("n", "<leader>gb", function()
		vscode.action("gitlens.toggleFileBlame")
	end, { silent = true })

	keymap("n", "<leader>zz", function()
		vscode.action("workbench.action.toggleZenMode")
	end, { silent = true })
end
