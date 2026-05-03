---
title: Playlistify
description: A mock UI project to show "music playlist analysis", but mostly to mess around with a retro UI library.
startDate: 2025-03-01
endDate: 2025-03-01
iconUrl: /icons/pie.svg
iconSize: 7
place: university
tags:
  - projects/full-stack
  - projects/class-project
links:
  - label: Website GitHub Repository
    url: https://github.com/abhigyantrips/Playlistify
attachments:
  - src: ../images/visualcss.png
    alt: VisualCSS Demo Screenshot
---

## About

Playlistify is a mock project that uses the Spotify Web API to analyze the user's playlists, genre distribution and mood, and recommends a few songs based on the data. This project was built to partially fulfil my credits for my Data Analytics Minor Specialization.

The project started off with the hope to utilize Spotify's audio features/audio analysis data in order to compute the playlist mood, but soon I learned that the API endpoints had already been deprecated by Spotify as this was _very_ valuable data that could be used by companies to train their own ML models.

Hence, this project turned into a fun exploration of UI and layouts while I learned more about the usage of Spotify's API and OAuth methods. Instead of showing the mood and computed recommendations, the app now shows the genre distribution and relative popularity of tracks in the playlist.

P.S. The "Your Recommendations" section just omits 5 tracks from the track list and shows them as recommendations. All to show how it would work IRL!
