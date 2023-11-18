---
title: inlang
description: Building an ecosystem for globalization.
icon: /images/inlang/inlang-icon.svg
cover: /images/inlang/cover-inlang.jpg
date: 10 / 2023
---

<info-grid>
<div>

# inlang

Building an ecosystem for globalization with a team consisting of designers and engineers.
I'm working at inlang as a design engineer, starting in mid-june 2023.

My main tasks were related to technical implementation and only a little bit of design.
If you are interested in my abilities as a designer, please visit another case study. This case study will
most likely only interested you when you want to know more about me as a developer.

</div>

<collaborators>

#### Colleagues

- [![Samuel Stroschein Avatar](/images/avatars/samuel_stroschein.jpg) Samuel Stroschein](https://github.com/samuelstroschein)
- [![Felix Häberle Avatar](/images/avatars/felix_haeberle.jpg) Felix Häberle](https://felixhaeberle.com/)
- [![Nils Jacobsen Avatar](/images/avatars/nils_jacobsen.jpg) Nils Jacobsen](https://github.com/NilsJacobsen)
- [![Niklas Buchfink Avatar](/images/avatars/niklas_buchfink.jpg) Niklas Buchfink](https://niklasbuchfink.com/)
- [![Jannes Blobel Avatar](/images/avatars/jannes_blobel.jpg) Jannes Blobel](https://github.com/jannesblobel)
- [![Jan Johannes Avatar](/images/avatars/jan_johannes.jpg) Jan Johannes](https://github.com/janfjohannes)

</collaborators>
</info-grid>

![inlang.com](/images/inlang/cover-inlang.jpg)

When you have ever worked with i18n in development, you know that it's a pain. It is a pain to implement, it is a pain to find the right
library, it is a pain to preserve type safety, update translations, and see what's wrong… the list is infinite.

With inlang, we are working towards a more unopinionated approach which basically means: Having an ecosystem consisting of all kinds of tools that you might need for your i18n purpose.

<three-full-grid>

![inlang markdown](/images/inlang/inlang_markdown.webp)
![inlang search](/images/inlang/inlang_search.webp)
![inlang install](/images/inlang/inlang_install.webp)

</three-full-grid>

<process-grid>

### Challenge

The general challenge for inlang and the whole team was the need to build something that didn't exist yet. What that means is basically the need to write a lot of code. For me personally, working on such a big project was quite hard. I've never worked on a codebase that big before and my typescript skills were not really good at the time.

<div>

### Action

</div>

<div>

#### Division of labor

**Obviously, we didn't wanted to work in chaos. That's why we have split up and I mainly worked on inlang.com's apps including inlang/marketplace, inlang/markdown, inlang/install, and inlang/markdown.**

#### Marketplace & Markdown

In the beginning, inlang's marketplace was just a subpage of inlang.com. After a team-wide decision in September 2023, we chose to make inlang.com a marketplace, because our product is too unique to be definable in a landing page. Additionally, having a marketplace would make things much easier in terms of scaling. The landingpage we showed before on one page, now got externalized to own products which would have their own chance for showcasing them as products on inlang.com.

Example for a inlang.com manifest (imagine it like a package.json):

```json
{
  "id": // id for the product
  "icon": // icon for the product
  "gallery": [
    // an array of images for the slider and opengraph image
  ],
  "displayName": {
    "en": // a display name for the product and title
  },
  "description": {
    "en": // a small description for the product and meta description
  },
  "readme": {
    "en": // a readme as markdown file
  },
  "keywords": [
    // an array of keywords
  ],
  "recommends": [
    // an array recommending other products
  ],
  "publisherName": // the name of the publisher
  "publisherIcon": // the avatar / logo of the publisher
  "license": // the license of the product
}
```

This file then gets added to inlang's registry file via a PR. After the PR is approved, the item is visible within the next deployment. It also automatically gets synced with the search-backend Algolia, which you can find more information later on.

As stated above, in addition to introducing product manifests, I also had to find a solution for implementing product pages in a simple but attractive way. In addition to refactoring the markdown process (getting rid of markdoc and using more unopinionated technologies like remark/rehype), I've introduced custom lit web-components. Web components are so extremely flexible, that they work everywhere. In every framework and in pure HTML and JavaScript. This way we have achieved to give our users the simplicity of using markdown while being able to use more advanced components for their projects.

#### Search

When transforming the inlang.com into one marketplace of products, we had to find another solution for searching for products. The search was just consisting of conditional logic, basically written in pure JavaScript to filter out items from a json-array.

I've tested and combined the most popular search engines, Algolia, typesense, and much more. In the end, I was left with two candidates: Algolia and Orama. Algolia is not open-source, but really good and really easy to maintain while Orama has a self-host option for NodeJS and is more like an indie-project, which I really liked. Because Algolia had a few more benefits and was maintained by a big team, we decided to go with Algolia to power our search.

#### Install

When you are using products from inlang, you have to set up a project. Usually, you have a project file that contains all the information about the products you are using, such as plugins and lint rules. Installing them manually would cost a bit of time, as you have to copy the jsdeliver link of the product into your project file.

To make the lives of our users easier, I implemented inlang.com/install which provides an automatic setup for users and commits directly into the repository of the user.

</div>

### Result

Generally, inlang's repository has over 7,000 commits, reached over 750 stars, and almost has 50 contributors (mid-November '23).
In the time I've been working at inlang, I've made over 500 commits, have learned an insane amount of coding skills and how to properly use typescript in such projects, and got a lot of technical insights into how you are building infrastructure in the 2020s.

</process-grid>

<project-links>

[inlang](https://www.inlang.com/)
[GitHub Repo](https://github.com/inlang/monorepo)
</project-links>
