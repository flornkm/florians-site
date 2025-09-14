---
title: Spinning Objects
description: How to create looping video of objects (3D models) in no time
date: 08 / 2025
type: post
---

# Spinning objects

I have posted a video of different spinning objects. Based on this, I got a lot of question on how I created those objects.

The short answer is:
Not a 3D tool.

[@video:/collection/spinning-objects/spinning-objects.webm|autoplay|muted|loop|playsInline|class="w-full object-cover aspect-video"]


## How to do it

<img class="w-20" src="/collection/spinning-objects/brick.png" alt="MidJourney Image" />

### Create an image in MidJourney

Head to [MidJourney](https://www.midjourney.com/) and create an object you like.

Here's what works best:
- Use an object that has enough contrast to the background (or use a green screen)
- Make the object appear simple (e.g. if you generate an acai bowl, don't add too many ingredients)
- Reduce transparent layers to a minimum wherever possible
- Use an isometric perspective

<br />


[@video:/collection/spinning-objects/raw-rotating-block.mp4|autoplay|muted|loop|playsInline|class="max-w-24 aspect-square object-contain"]


### Turn your image into a video

You need an AI video generator which supports an endframe. The endframe is important because it determines the final appearance of the spinning object.
This allows us to stop where we started, hence creating a seamless loop.

Nowadays Midjourney also supports this, so you can just use it. Another option is [Kling](https://www.klingai.com/) 1.6.

Here are some considerations:
- Make sure the endframe is really identical to the startframe
- Prompt so the speed stays the same, otherwise it'll look weird

<br />

[@video:/videos/rotating-block.mp4|webm:/videos/rotating-block.webm|mp4:/videos/rotating-block.mp4|autoplay|muted|loop|playsInline|class="max-w-24 aspect-square object-contain"]

### Remove the background

For removing the video background, I recommend using [Unscreen](https://www.unscreen.com/). It'll convert your video into a GIF but will make it transparent.

I have used other tools as well but they are often smoothing out edges which is not what we want.
Although Unscreen is not perfect (if you look closely you'll see some artifacts), it's fast and pretty reliable.

To make your video size small, you should convert it to a WEBM file (it supports transparency). You can use a bunch of different sites for this.

If you're a programmer, you obviously can also do many of these things with **ffmpeg**.

## Next

If you create a spinning object, I'd be super happy to see it! Feel free to share it [@flornkm](https://x.com/flornkm) with me, I'm excited to see what you come up with.
