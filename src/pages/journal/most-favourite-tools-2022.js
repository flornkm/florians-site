import Journal from "@/components/Journal";

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={"images/journal/favourite-tools/tools_i_use.jpeg"}
        title={"Most Favourite Tools"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Airtable</h3>
              <p className="mb-8">
                Airtable is a tool which you can use for a variety of different
                things. It is a database, a spreadsheet, a kanban board and much
                more. It is a very powerful tool and it is very easy to use. I
                use it for my blog, my finances and surveys. A lot of people use
                it for project management. I think that Airtable is a very
                underrated tool.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Raycast</h3>
              <p className="mb-8">
                Raycast is a tool that allows you to control your computer with
                your keyboard more efficiently. It has a great developer
                community and you can extend the basic software even more with
                plugins. I use it to control my computer, to search for files
                and to control my music player. It is a very powerful tool and I
                use it every day.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Notion</h3>
              <p className="mb-8">
                With Notion you can create notes. But it is even more than that,
                you can easily create a website with it. You can also create a
                database and a kanban board. It is very powerful and I use it
                for my studies, my To-Do lists and everything I am managing.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Arc</h3>
              <p className="mb-8">
                Arc is a modern browser that gives you a unique experience. It
                is based on chromium and it is very fast altough it gives you a
                lot of features on top. You can manage your tabs more
                efficiently, you can use a dark mode and you can use a lot of
                extensions. I use it as my main browser.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Figma</h3>
              <p className="mb-8">
                Figma is basically a tool that allows you to create designs for
                websites and apps. It is most commonly used at User Interface
                Design. But I am using it as a replacement for Photoshop and a
                lot of other tools because you can, thanks to the plugins, do a
                lot of efficient things with it.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Vercel</h3>
              <p className="mb-8">
                Vercel is a tool that allows you to host your website for free.
                It is very easy to use and it is very fast. I use it to host my
                blog and my website. It is a very powerful tool and I am very
                happy with it.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">Splitbee</h3>
              <p className="mb-8">
                Splitbee is a tool that allows you to track your website. It has
                a stunning UI and gives you a lot of cool features. You can use
                it as an alternative to Google Analytics.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">GitHub Copilot</h3>
              <p>
                GitHub Copilot is a tool that has written some of the code for
                this article. It is a tool that allows you to write code faster.
                I am happy with it and it helps me a lot.
              </p>
            </article>
          </>
        }
      />
    </>
  );
}
