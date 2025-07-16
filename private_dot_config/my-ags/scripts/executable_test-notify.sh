
#!/bin/bash

# Play a notification sound (optional, adjust path to sound file)
play_sound() {
  # Try paplay (PulseAudio)
  if command -v paplay >/dev/null 2>&1; then
    paplay /usr/share/sounds/freedesktop/stereo/complete.oga
  # Fallback to aplay (ALSA)
  elif command -v aplay >/dev/null 2>&1; then
    aplay /usr/share/sounds/alsa/Front_Center.wav
  fi
}

echo "Sending test notifications with different parameters..."

# Basic notification
notify-send "Basic Notification" "This is a basic notify-send test."

sleep 1

# Notification with expire time 5 seconds
notify-send -t 5000 "Expire Time 5s" "This notification will expire in 5 seconds."

sleep 6

# Notification with expire time 0 (default: stays until dismissed)
notify-send -t 0 "Expire Time 0" "This notification will not disappear automatically."

sleep 3

# Notification with icon
notify-send -i dialog-information "Notification with Icon" "Using the info icon."

sleep 2

notify-send -i /usr/share/icons/hicolor/32x32/apps/firefox.png "Notification with App Icon" "Using firefox logo."

sleep 2

# Notification with urgency low
notify-send -u low "Low Urgency" "This notification is low urgency."

sleep 2

# Notification with urgency normal
notify-send -u normal "Normal Urgency" "This notification is normal urgency."

sleep 2

# Notification with urgency critical
notify-send -u critical "Critical Urgency" "This notification is critical urgency."

sleep 2

# Notification with very long body text
notify-send "Long Body Text" "This is a very long body text to test how the notification handles overflow or text wrapping in the notification popup. It should wrap nicely or be truncated depending on your desktop environment."

sleep 2

# Notification with summary and body swapped to test formatting
notify-send "Summary Only"

sleep 1

notify-send "Summary with Empty Body" ""

sleep 1

notify-send -t 3000 -i face-smile "Notification with smile icon" "Have a nice day!"

sleep 2

# Notification with hint (value is a string)
notify-send "Notification with hint" "Check this hint example" -h string:sound-file=/usr/share/sounds/freedesktop/stereo/message.oga

sleep 2

# Play a notification sound manually alongside notify-send (since notify-send doesn't play sounds)
notify-send "Notification with sound" "Playing sound separately."
play_sound

sleep 3

# Multiple notifications in quick succession
for i in {1..5}; do
  notify-send "Burst Notification $i" "Testing multiple notifications in a row."
  sleep 0.5
done

echo "All tests sent."
