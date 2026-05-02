---
title: VisualCSS
description: An administrative ticket management system built for three-way communication between faculty, administration, and students.
startDate: 2025-03-01
endDate: 2025-03-01
iconUrl: /icons/paint-bucket.svg
iconSize: 8
place: university
tags:
  - projects/class-project
links:
  - label: Website GitHub Repository
    url: https://github.com/YCN-club/helpdesk-website
  - label: API GitHub Repository
    url: https://github.com/YCN-club/helpdesk-api
attachments:
  - src: ../images/visualcss.png
    alt: VisualCSS Demo Screenshot
---

## About

VisualCSS is a Live Code Editor to visualize HTML/CSS debugging. This project was built to partially fulfil my credits for my Web Programming Lab, and acts as a simple proof-of-concept for what can be done through a little bit of injected CSS/JavaScript.

The project works by accepting HTML code in a web editor (in this case, CodeMirror), which is then passed on to an `<iframe>` on the right. Here, it is rendered with a bit of pre-defined "debugger CSS" along with a script that calculates the size of all elements and their containers. If it is found that some content is larger than the parent container, it is marked as "Overflow" and highlighted with corresponding tags in the `<iframe>`.

This is a weekend project that can be delved into much deeper – incorporating scroll detection and content clipping, throwing errors for incorrect HTML, implementing a ruler/grid system, and so on. I'm glad I carried this out. :)
