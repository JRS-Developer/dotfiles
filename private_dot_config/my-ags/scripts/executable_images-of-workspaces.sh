#!/bin/bash

# Delay (seconds) after workspace switch to allow rendering
SWITCH_DELAY=0.5

# Get list of workspace IDs
workspaces=$(hyprctl workspaces -j | jq -r '.[].id')

for ws in $workspaces; do
    echo "Switching to workspace $ws"
    hyprctl dispatch workspace "$ws"
    sleep $SWITCH_DELAY

    clients_json=$(hyprctl clients -j)
    echo "$clients_json" | jq -c ".[] | select(.workspace.id == $ws)" | while read -r client; do
        title=$(echo "$client" | jq -r '.title // empty' | tr -s ' ' '_' | tr -cd '[:alnum:]_-')
        x=$(echo "$client" | jq -r '.at[0] // empty')
        y=$(echo "$client" | jq -r '.at[1] // empty')
        w=$(echo "$client" | jq -r '.size[0] // empty')
        h=$(echo "$client" | jq -r '.size[1] // empty')

        # Skip if missing info
        if [[ -z "$title" || -z "$x" || -z "$y" || -z "$w" || -z "$h" ]]; then
            echo "Skipping window with missing info: title='$title', geometry=($x,$y,$w,$h)"
            continue
        fi

        geometry="${x},${y} ${w}x${h}"
        filename="preview_ws${ws}_${title}.png"

        echo "Capturing '$title' on workspace $ws with geometry $geometry into $filename"
        grim -g "$geometry" "$filename"
    done
done

echo "Done capturing all workspaces."
