#!/bin/bash

album_art=$(playerctl -p YoutubeMusic metadata mpris:artUrl)

if [[ -z $album_art ]]; then
  # no art or player stopped
  exit
fi

curl -s "${album_art}" --output "/tmp/youtube_music_cover.jpeg"

echo "/tmp/youtube_music_cover.jpeg"
