---
title: Dither
description: A css-only dithering plugin, open source and compatible with tailwind.
date: 09 / 2025
type: project
---

# Dither

I love dithers, but I always found it hard to create one.

Developers needed to implement custom WebGL shaders to achieve the desired effect.

For me, it always felt unsettling – like it is too much tech debt in a way.

<div class="dark:invert">
<div class="dither w-full h-40 bg-gradient-to-t from-neutral-500 to-neutral-900"></div>
</div>

So while flying to SF I had 11 hours of time to think about a solution.

In the end, I started with what I thought was the simplest solution: custom SVG filters.

But even that was not good. If I'd publish a package with custom SVG filters, I can't allow people to use it as a standalone tailwind plugin. Instead, people would have had to import a custom component containing the SVG filter, or I'd have to store the SVG filter as a URI object in the source CSS. This however didn't work for Safari browsers.

A few months I didn't think about it and left the project still, as I was busy with other pojects.

Then, I needed the dither effect again, so I decided to try another rewrite approach.

This time I used ChatGPT. I had endless conversations going back and forth how we could accomplish these things:
- Create a simple dither effect via Tailwind utilities
- Allow all browsers to accurately display the effect
- Don't depend on any external libraries
- Don't depend on JS
- Make it as easy as possible to use

Interestingly, after a lot of discussion, ChatGPT came up with a proper solution, combining blur, contrast, brightness, and greyscale effects with a background image of the bayer dither grid.

This allowed all browsers to process the image and overlay it with whatever is inside the element with the class name "dither".

So I tested it with some people from X, they gave me feedback, and I released at the end of the week. Pretty simple, but happy I was able to solve this little problem for myself (and hopefully others).

---

You can find the dither effect here: [Dither Plugin](https://dither.floriankiem.com/)

Try it out for yoursefl! :)
