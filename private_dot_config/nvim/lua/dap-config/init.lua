local dap, dapui = require("dap"), require("dapui")

-- Adapters config
dap.adapters.chrome = {
	type = "executable",
	command = "node",
	args = { os.getenv("HOME") .. "/.local/share/nvim/mason/packages/chrome-debug-adapter/out/src/chromeDebug.js" }, -- TODO adjust
}
dap.adapters.node2 = {
	type = "executable",
	command = "node",
	args = { os.getenv("HOME") .. "/.local/share/nvim/mason/packages/node-debug2-adapter/out/src/nodeDebug.js" },
}
dap.adapters.node = {
	type = "executable",
	command = "node",
	args = { os.getenv("HOME") .. "/.local/share/nvim/mason/packages/node-debug2-adapter/out/src/nodeDebug.js" },
}

-- Listeners for dap ui
dap.listeners.after.event_initialized["dapui_config"] = function()
	dapui.open()
end
dap.listeners.before.event_terminated["dapui_config"] = function()
	dapui.close()
end
dap.listeners.before.event_exited["dapui_config"] = function()
	dapui.close()
end

local react_config = {
	{
		type = "chrome",
		request = "attach",
		program = "${file}",
		cwd = vim.fn.getcwd(),
		sourceMaps = true,
		protocol = "inspector",
		port = 9222,
		webRoot = "${workspaceFolder}",
	},
}

--[[ local js_config = { ]]
--[[ 	{ ]]
--[[ 		name = "Launch", ]]
--[[ 		type = "node2", ]]
--[[ 		request = "launch", ]]
--[[ 		program = "${file}", ]]
--[[ 		cwd = vim.fn.getcwd(), ]]
--[[ 		sourceMaps = true, ]]
--[[ 		protocol = "inspector", ]]
--[[ 		console = "integratedTerminal", ]]
--[[ 	}, ]]
--[[ } ]]

--[[ dap.configurations.javascript = js_config ]]
--[[ dap.configurations.typescript = js_config ]]
dap.configurations.javascriptreact = react_config
dap.configurations.typescriptreact = react_config
