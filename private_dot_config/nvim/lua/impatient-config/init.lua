local status_ok, configs = pcall(require, "impatient")
if not status_ok then
	return
end

configs.enable_profile()
