---
title: SafeQR
description: An administrative ticket management system built for three-way communication between faculty, administration, and students.
startDate: 2025-03-01
endDate: 2025-03-01
iconUrl: /icons/qr.svg
iconSize: 8
place: university
tags:
  - projects/class-project
links:
  - label: Website GitHub Repository
    url: https://github.com/YCN-club/helpdesk-website
  - label: API GitHub Repository
    url: https://github.com/YCN-club/helpdesk-api
collaborators:
  - name: Chilveri Srujan Kumar
    url: https://www.linkedin.com/in/srujan-chilveri-95aa27247
attachments:
  - src: ../images/visualcss.png
    alt: VisualCSS Demo Screenshot
---

## About

SafeQR is a QR code creator/scanner that transfers encrypted data through QR codes. This project was built to partially fulfill our credits for the Applied Cryptography Lab and showcases encryption/decryption and minimal steganography, all the on the client-side.

The project uses AES-256 symmetric encryption for the content of the QR code, with PBKDF for generating a key based in the "password" input by the user – the same "password" can then be used to decrypt the data on the other end.

The highlight of this project is the implementation of Least Significant Bit (LSB) steganography, which allows storage of data within the downloaded QR code image. Once uploaded, this data can be decoded using the same passkey that decodes the QR code content.
