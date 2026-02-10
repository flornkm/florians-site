---
title: inlang
description: Localization ecosystem for software
cover: /images/inlang/inlang.webp
date: 10 / 2023
collaborators: Samuel Stroschein, Nils Jacobsen, Niklas Buchfink, Jannes Blobel, Jan Johannes, Felix Haeberle
links: https://inlang.com
---

# Reimagining i18n for developers

One file format that is interoperable between multiple apps, built on git's core principles.

![inlang](/images/inlang/inlang.webp)

inlang enables developers to easily setup and use one file format for their translations.
What that means in practice is, that in contrast to other translation tools which use databases to store translation strings, inlang does it fully file-based and agnostic.

This approach makes it significantly more easy for developers to integrate it into their tech stack, use one of many apps from the inlang marketplace
or simply build their own solution using [inlang's SDK](https://github.com/opral/inlang-sdk), than it is to integrate cloud based software, especially when the mounts of files reached a significant amount.

## Marketplace

My personal focus at inlang was mainly taking care of the marketplace and mini-apps allowing users easier access to manage their projects.

![inlang design](/images/inlang/inlang-design.webp)

We transformed inlang.com from a simple landing page into a comprehensive marketplace. Additionally, we introduced manifests (similar to a package.json), that defined product metadata to integrate it into one central hub.

```json
{
  …,
  "properties": {
    …,
    "icon": {
      "type": "string",
      "format": "uri",
      "description": "Icon URL."
    },
    "gallery": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "uri"
      },
      "description": "Image URLs for gallery display."
    },
    "displayName": {
      "type": "object",
      "description": "Localized display names.",
      "additionalProperties": { "type": "string" }
    },
    "description": {
      "type": "object",
      "description": "Localized descriptions.",
      "additionalProperties": { "type": "string" }
    },
    "readme": {
      "type": "object",
      "description": "Localized README URLs.",
      "additionalProperties": {
        "type": "string",
        "format": "uri"
      }
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" }
    },
    …
  },
  …
}
```

To enhance product pages, I refactored the markdown parsing system, moving away from markdoc to remark/rehype. I introduced custom lit web components that work across all frameworks and in pure HTML/JavaScript, giving users the simplicity of markdown while enabling them to reference custom components offered by our library to show interactive descriptions.

As we evolved into a marketplace, we needed a robust search solution. After looking up and testing popular search engines including Algolia, typesense, and others, we selected Algolia for its reliability.


## Installation wizard

[@video:/videos/inlang-installer.mp4|autoplay|muted|loop|playsInline|height:16rem|className:object-cover w-full object-top]

To simplify the user experience, I built a platform where users can open their inlang files and install products with just a few clicks, instead of relying on developers to do it.

By early 2023, inlang's repository had accumulated over 9,000 commits, reached more than 850 stars, and attracted nearly 50 contributors. Given my sole design background, I was able to get a lot of hands-on Javascript and Typescript experience.
