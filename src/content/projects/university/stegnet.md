---
title: StegNet
description: An administrative ticket management system built for three-way communication between faculty, administration, and students.
startDate: 2025-03-01
endDate: 2025-03-01
iconUrl: /icons/shield.svg
iconSize: 7
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

StegNet is a network steganography toolkit for covert communication over TCP, ICMP, DNS, and HTTP. It integrates encryption, message hiding, packet manipulation, and traffic analysis into a modular, scalable design using OOP principles.

This project uses `scapy`, a packet manipulation tool in Python, for crafting network packets based on the parameters received from the user through the command line. The packet is then sent across the network through a given protocol (TCP/ICMP/DNS/HTTP) to the specified destination, with data that is encrypted and hidden in the packet parameters.

The StegNet library also provides a command that allows reception of packets on the receiving end, which are automatically decrypted based on the correct AES-256 passphrase entered by the user. Lastly, the user can check incoming traffic for possibly hidden parameters using the `stegnet analyze` command.

This is a project we carried out for the partial fulfilment of credits of our Cybersecurity and Forensics Laboratory. While the execution is novel, the algorithms are extremely hardcoded and further iterations of the project can expand on the concepts of modularity and randomization/entropy.
