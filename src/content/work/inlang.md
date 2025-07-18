---
title: inlang
description: The ecosystem for globalization needs.
cover: /images/inlang/inlang.webp
date: 10 / 2023
collaborators: Samuel Stroschein, Nils Jacobsen, Niklas Buchfink, Jannes Blobel, Jan Johannes, Felix Haeberle
links: inlang.com
---

# Reimagining i18n for developers

inlang is an ecosystem of tools for internationalization needs, taking an unopinionated approach that gives developers flexibility without forcing specific implementations.

![inlang](/images/inlang/inlang.webp)

## The Idea

Anyone who has worked with i18n in development knows the pain points: implementation challenges, finding the right library, preserving type safety, updating translations, collaborating with translators, and troubleshooting issues. inlang addresses these problems with an ecosystem of tools that work together without forcing developers into a specific approach.

## Challenge

Building something that didn't exist yet was our primary challenge. How do you define a product that isn't fully conceptualized? For me personally, joining an established team meant quickly understanding a complex codebase and how all components worked together.

## Action

**Division of labor**  
We organized our work efficiently, with my focus on inlang.com's applications including the Marketplace, Markdown Parser, and tools for managing plugins and lint rules.

**Marketplace & Markdown**  
We transformed inlang.com from a simple landing page into a comprehensive marketplace. This strategic pivot allowed individual products to showcase themselves and build their own communities. I implemented a manifest system (similar to package.json) that defined products and their metadata.

To enhance product pages, I refactored the markdown parsing system, moving away from markdoc to more flexible technologies like remark/rehype. I introduced custom lit web components that work across all frameworks and in pure HTML/JavaScript, giving users the simplicity of markdown with advanced component capabilities.

**Search implementation**  
As we evolved into a marketplace, we needed a robust search solution. After evaluating popular search engines including Algolia, typesense, and others, we selected Algolia for its reliability, ease of maintenance, and startup program benefits.

**Installation experience**  
To simplify the user experience, I built manage.inlang.com where users can open their inlang projects and install products with just a few clicks, eliminating manual copying of links and streamlining language tag management.

## Result

By early 2023, inlang's repository had accumulated over 9,000 commits, reached more than 850 stars, and attracted nearly 50 contributors. During my time with inlang, I contributed over 850 commits while significantly improving my technical skills, particularly in TypeScript. The project provided valuable insights into modern infrastructure development practices.
