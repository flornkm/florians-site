---
title: inlang
description: Building an ecosystem for globalization.
icon: /images/inlang/inlang-icon.svg
cover: /images/inlang/inlang.png
date: 10 / 2023
---

<info-grid>
<div>

|               |                                                                                                                                                                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Year          | 2023                                                                                                                                                                                                                                                                                                                                                                     |
| Collaborators | [Samuel Stroschein](https://github.com/samuelstroschein), [Felix Häberle](https://github.com/felixhaeberle), [Jan Johannes](https://github.com/janfjohannes), [Niklas Buchfink](https://github.com/NiklasBuchfink), [Nils Jacobsen](https://github.com/NilsJacobsen), [Jannes Blobel](https://github.com/jannesblobel), [Loris Sigrist](https://github.com/LorisSigrist) |
| Website       | [inlang.com](https://inlang.com)                                                                                                                                                                                                                                                                                                                                         |

</div>

<div>

# inlang

Building an ecosystem for globalization with a team consisting of designers and engineers.
I worked at inlang as a design engineer from mid-june 2023 to mid-january 2024.

My main tasks were related to technical implementation and product building.
This case study is more focused on the technical side of things as these were the tasks I've spent most of my time on.

</div>
</info-grid>

![inlang.com](/images/inlang/cover-inlang.jpg)

When you have ever worked with i18n in development, you know that it's a pain. It is a pain to implement, it is a pain to find the right
library, it is a pain to preserve type safety, update translations, working together with translators and see what's wrong… the list is infinite.

Together with the inlang team, we were working towards a more unopinionated approach which basically means: Having an ecosystem consisting of all kinds of tools that you might need for your i18n purpose, but not forcing you to use them.

<three-full-grid>

![inlang markdown](/images/inlang/inlang_markdown.webp)
![inlang search](/images/inlang/inlang_search.webp)
![inlang install](/images/inlang/inlang_install.webp)

</three-full-grid>

<process-grid>

### Challenge

The general challenge for inlang and the whole team was the need to build something that didn't exist yet. How to build a product that is not yet defined? Write code. Write code. Write code. Obviously, for such a mammoth task you need a team of talented people. When I joined, the biggest challenge for me was to get into the codebase and understand how everything works together.

<div>

### Action

</div>

<div>

#### Division of labor

**Obviously, we didn't wanted to work in chaos. That's why we have split up and I mainly worked on inlang.com's apps including the Marketplace, the Markdown Parser, and the app to manage plugins and lint rules.**

#### Marketplace & Markdown

In the beginning, inlang's marketplace was just a subpage of inlang.com. After a team-wide decision in September 2023, we chose to make inlang.com a marketplace, because inlang itself isn't a product nor can it be defined in a single, ordinary marketingpage. Additionally, having a marketplace would make things much easier in terms of scaling. The landingpage we showed before on one page, now got externalized to own products which would have their own chance for showcasing them as products and grow their own community.

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

This file gets added to inlang's registry file via a PR. After the PR is approved, the item is visible with next deployment. It also automatically gets synced with the search-backend Algolia, which you can find more information later on.

As stated above, in addition to introducing product manifests, I also had to find a solution for implementing product pages in a simple but attractive way. In addition to refactoring the markdown parsing (getting rid of markdoc and using more flexible technologies like remark/rehype), I've introduced custom lit web components. Web components are so super flexible, that they work everywhere. In every framework and in pure HTML and JavaScript. This way we have achieved to give our users the simplicity of using markdown while being able to use more advanced components for their product pages.

#### Search

When transforming the inlang.com into one marketplace of products, we had to find another solution for searching through the index of products. The search was just consisting of conditional logic, basically written in pure JavaScript to filter out items from an array. Not really scalable and user-friendly.

I've tested and combined the most popular search engines, Algolia, typesense, and much more. In the end, I was left with two candidates: Algolia and Orama. Algolia is not open-source, but really good and super easy to maintain while Orama has a self-host option for NodeJS and is more like an indie-project, which I really liked. Because Algolia had more benefits, we got approved in their startup program, and was maintained by a big team (= reliability), we decided to go with Algolia to power our search.

#### Install

When you are using products from inlang, you have to set up a project. Usually, you have a project file that contains all the information about the products you are using, such as plugins and lint rules. Installing them manually would cost a bit of time, as you have to copy the jsdeliver link of the product into your project file (and you need an IDE in the first place).

To make the lives of our users easier, I implemented [manage.inlang.com](https://manage.inlang.com/) where you can open your inlang project and install products within a few clicks. This way, you don't have to copy and paste links anymore, but can just click on the product you want to install and it gets installed automatically. You're also able to edit your language-tags.

</div>

### Result

Generally, inlang's repository has over 9,000 commits, reached over 850 stars, and almost has 50 contributors (mid-January '23).
In the time I've been working at inlang, I've made over 850 commits, have learned an insane amount of coding skills, first of all how to properly use typescript, and got a lot of technical insights into how you are building infrastructure in the 2020s. Looking forward to staying in touch with the team and see how inlang is growing. If you're interested in joining them, write to [hello@inlang.com](mailto:hello@inlang.com).

</process-grid>

<project-links>

[inlang](https://www.inlang.com/)
[GitHub Repo](https://github.com/inlang/monorepo)
</project-links>
