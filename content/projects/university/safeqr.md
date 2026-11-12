---
title: SafeQR
description: A showcase of using QR codes as a way to transfer encrypted data (through symmetric encryption), which can be decoded by the reader through a given password.
startDate: 2025-03-01
endDate: 2025-03-01
iconUrl: /icons/qr.svg
iconSize: 8
place: university
tags:
  - projects/class-project
links:
  - label: Website GitHub Repository
    url: https://github.com/abhigyantrips/SafeQR
collaborators:
  - name: Chilveri Srujan Kumar
    url: https://www.linkedin.com/in/srujan-chilveri-95aa27247
---

## About

SafeQR is a QR code creator/scanner that transfers encrypted data through [QR codes](https://en.wikipedia.org/wiki/QR_code). This project was built to partially fulfill our credits for the **Applied Cryptography Lab** and showcases encryption/decryption and minimal steganography, all done on the client-side.

The project uses [AES-256 symmetric encryption](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) for the content of the QR code, with [PBKDF](https://en.wikipedia.org/wiki/PBKDF2) for generating a key based in the "password" input by the user. The same "password" can then be used to decrypt the data on the other end.

The highlight of this project is the implementation of Least Significant Bit (LSB) [steganography](https://en.wikipedia.org/wiki/Steganography#Cyber-physical_systems/Internet_of_Things), which allows storage of data within the downloaded QR code image. Once uploaded, this data can be decoded using the same passkey that decodes the QR code content.

## The Story
