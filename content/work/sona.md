---
title: Sona
description: Lightweight and affordable transcriptions.
cover: /images/sona/sona.webp
date: 11 / 2024
collaborators: Nils Eller
links: https://sona.com, https://apps.apple.com/app/sona
---

# Making transcriptions accessible.

Sona captures conversations and meetings, delivering insights that matter most to you. It consists of iOS and watchOS apps backed by powerful infrastructure to process audio and extract valuable information.

![Sona](/images/sona/sona.webp)

## The Idea

When taking walks with friends, I often want to preserve our conversations and ideas. Sona captures these fleeting moments and makes them tangible. It's also valuable for professionals who speak with people daily, helping them remember key details from conversations.

## Challenge

Taking notes in meetings is essential for gathering context and information. However, remembering key details is difficult, especially when you can't write things down.

## Action

**Building for ourselves first**  
We initially created Sona for ourselves and close friends, focusing on capturing the most important details. Early feedback showed us this tool could help many others.

**Backend infrastructure**  
We built a custom Express backend running on our own GPUs to process audio data. Our pipeline includes automated actions like auto-filling speaker names and summarizing transcripts for high-quality insights.

**iOS + watchOS apps**  
We developed mobile apps with SwiftUI to provide a seamless experience. Users can record audio, view transcripts, and access insights all in one place.

**Technical challenges**  
One major hurdle was receiving accurate user information in our backend. Apple's ecosystem made this difficult compared to platforms like Stripe. We leveraged App Store Connect API with Server Notifications v2, requiring extensive testing to ensure reliability.

<video
          src="/videos/sona.webm"
          autoPlay
          muted
          loop
          playsInline
        ></video>

## Result

Sona launched successfully on ProductHunt, reaching nearly 10,000 users in its first month. We're now expanding beyond summaries to provide even greater value to our users.
