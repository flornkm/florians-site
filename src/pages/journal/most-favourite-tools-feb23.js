import Journal from "@/components/Journal";
import Link from "next/link";

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={
          "images/journal/favourite-tools-feb23/most_favourite_tools_feb23.webp"
        }
        title={"Flos most favourite tools: February 2023 edition"}
        date={"2023-02-28"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">
                Supabase <br/><span className="text-gray-500 text-lg">From database to user authentication</span>
              </h3>
              <p className="mb-6">
                We began developing a new update for our app. We decided to use
                Supabase as our backend. Not only is supabase extremely easy to
                use, it also has a very intuitive design. Supabase comes with a
                lot of different features that are helping us to fulfill our
                needs. Personally, I just can recommend anyone to use Supabase,
                even if you are just starting out or used to Firebase.
              </p>
              <Link
                className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-gray-100 transition-all font-medium border border-solid border-gray-300 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                href="https://supabase.com/"
                target="_blank"
              >
                Supabase
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-10">
                Cosmos <br/><span className="text-gray-500 text-lg">A new way to save and look at your favorite things</span>
              </h3>
              <p className="mb-6">
                Cosmos is a relatively new platform and browser extension. It is
                a little bit like Pinterest, but it is more focused on curating
                your own little universe in a very easy and mindful way. The
                design is extraordinarily good and it has a free version. I am
                looking forward to use it for saving my favorite findings from
                around the internet. I just can recommend it to everyone, but
                make sure to install the browser extension because it will make
                your experience a lot better.
              </p>
              <Link
                className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-gray-100 transition-all font-medium border border-solid border-gray-300 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                href="https://cosmos.so/"
                target="_blank"
              >
                Cosmos
              </Link>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-10">
                Rive <br/><span className="text-gray-500 text-lg">Creating animations intuitively</span>
              </h3>
              <p className="mb-6">
                Rive is a tool I know for a while now, but because I was so used
                to Lottie, I never really used it. But recently I started to use
                it more (see the animation on my About page). Rive is a tool
                that allows you to create animations in a very easy way, the big
                benefit, in my opinion, is, that their own format is extremely
                small and can be used in a lot of different ways. You can also
                create your designs directly in their editor and then switch to
                the animation tab and create your animations. It is also
                possible to create animations directly based on mouse movements
                or other interactions.
              </p>
              <Link
                className="bg-white text-black pr-4 pl-4 pt-2 pb-2 rounded-md hover:bg-gray-100 transition-all font-medium border border-solid border-gray-300 dark:bg-transparent dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                href="https://rive.app/"
                target="_blank"
              >
                Rive
              </Link>
              <div className="h-10"></div>
            </article>
          </>
        }
      />
    </>
  );
}
