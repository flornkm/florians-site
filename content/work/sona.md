---
title: Sona
description: In-person and meeting insights.
icon: /images/sona/sona-icon.svg
cover: /images/sona/sona.png
date: 11 / 2024
---

<info-grid>

<div>

# Work

# Sona

</div>

<div>

With Sona, you can capture your conversations and meetings, and get insights that matter most to you. Sona is consisting of different apps + a backend infrastructure to handle audio data and provide insights.

</div>

<div>

|               |                                                                                  |
| ------------- | -------------------------------------------------------------------------------- |
| Year          | 2024                                                                             |
| Collaborators | [Nils Eller](https://nilseller.com)                                              |
| Website       | [Website](https://sona.wtf), [AppStore](https://apps.apple.com/app/id6717572715) |

</div>

</info-grid>

![Sona](/images/sona/sona.png)

When taking a walk with friends, I often find myself wanting to share my thoughts and ideas. Sona is my attempt to capture these fleeting moments and make them more tangible. In addition, it is a helpful tool for everyone who speaks with people on a daily basis in their professional life as Sona helps to remember key details from conversations.

<three-full-grid>

![Sona Apple Watch](/images/sona/sona-applewatch.png)
![Sona Details](/images/sona/sona-empty.png)
![Sona Hero Animation](/images/sona/sona-hero.png)

</three-full-grid>

<process-grid>

### Challenge

Taking notes in meetings is crucial for gathering context and information. However, it is often difficult to remember key details from conversations, especially in occassions where you are not able to write things down.

<div>

### Action

</div>

<div>

#### Building for ourself

In the beginning, we built Sona for ourselves and our friends. We wanted to gather the key details we need most. Showing this to a few friends, we realized that this is a tool that can be helpful for everyone.

#### Backend

To provide insights from the audio, we need to process the audio data. For this, we use our own GPUs and build a custom backend with Express. Additionally, we use a pipeline of automated actions, such as auto-filling speaker names and summarizing the transcript to ensure high-quality details.

#### iOS + WatchOS App

To provide a seamless experience, we also built a mobile app with SwiftUI. The app allows users to record audio, see the transcript, and view the insights.

##### Problems while building

One of the biggest challenges was to receive accurate information about the user in our custom backend. Apple doesn't have an easy way to get this done (with Stripe it is much easier). Using the App Store Connect API, we were able to receive the necessary information with their new Server Notifications v2. This however needed a lot of testing and implementation to make it work in a reliable way.

</div>

### Result

Sona had a successful launch on ProductHunt, reaching nearly 10,000 users within the first month. Moving forward, our plan is to expand the project beyond just curating summaries, providing users with even greater value and utility.

</process-grid>

<project-links>

[Sona](https://www.sona.wtf/)
[Product Hunt](https://www.producthunt.com/products/sona-5)

</project-links>
