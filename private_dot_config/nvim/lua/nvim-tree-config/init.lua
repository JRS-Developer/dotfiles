require("nvim-tree").setup({
	renderer = {
		root_folder_label = false,
	},
	update_focused_file = {
		enable = true,
		update_root = false,
		ignore_list = {},
	},
	diagnostics = {
		enable = true,
		show_on_dirs = true,
		show_on_open_dirs = true,
		debounce_delay = 50,
		icons = {
			hint = "",
			info = "",
			warning = "",
			error = "",
		},
	},
	git = {
		enable = true,
		ignore = false,
		show_on_dirs = true,
		show_on_open_dirs = true,
		timeout = 400,
	},
	modified = {
		enable = false,
		show_on_dirs = true,
		show_on_open_dirs = true,
	},
}) -- END_DEFAULT_OPTS
