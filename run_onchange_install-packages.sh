#!/bin/sh
# Install APT packages
sudo apt install ripgrep fd-find

# Install nvm (Node version manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# add a link to fd by executing command ln -s $(which fdfind) ~/.local/bin/fd, in order to use fd in the same way as in this documentation
if [ ! -L ~/.local/bin/fd ]; then
    ln -s $(which fdfind) ~/.local/bin/fd
    echo "Symlink created: ~/.local/bin/fd -> $(which fdfind)"
else
    echo "Symlink already exists: ~/.local/bin/fd"
fi
