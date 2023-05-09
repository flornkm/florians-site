import Journal from "@/components/Entry";

export default function JounalEntry() {
  return (
    <>
      <Journal
        mainImage={"images/entries/webdesign_in_the_future/websites_in_the_future.jpg"}
        title={"The Web in the future"}
        date={"2022-11-07"}
        text={
          <>
            <article className="text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white mt-16">
                The different stages
              </h3>
              <p className="mb-16">
                Web 1.0 was an era full of hyperlinks without any additional
                visuals or functions. When Web 2.0 came, most websites we know
                today (or not) where born. For example Facebook (now Meta),
                YouTube, Twitter and a lot more. These websites not only
                implemented CSS and JavaScript, they where also some of the
                first platforms that allowed users to interact with each other
                and for that reason track their data. Around the time these
                platforms got famous, in my perspective around 2010, Bitcoin was
                already a thing. But it was not until 2017 that it got really
                popular. Many tech-people used the term "Web 3.0" to describe
                the next stage of the internet. But what does that mean? And
                what will the internet look like in the future?
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">
                Web 3.0 is misleading
              </h3>
              <p className="mb-16">
                The term "Web 3.0" is often used in combination with crypto. But
                I don't think that this makes sense. I don't hate crypto, but I
                think because of the recent events (FTX) a lot of things will
                change and crypto will get much more regulated. Therefore I
                think cryptocurrencies will not be the main focus of the next
                stage of the internet. I think the main focus will be on
                decentralization, artificial intelligence and future
                technologies like quantum computing.
              </p>
              <h3 className="text-xl font-medium mb-2 text-black dark:text-white">
                Which problems will be solved?
              </h3>
              <p className="mb-24">
                Today we have a lot of problems on our planet. Not only the
                cimate change, but also the fact that we are running out of
                resources. We need to find a way to produce more food, energy
                and other resources. But we also need to find a way to produce
                them in a sustainable way. I think the internet will play a big
                role in solving these problems. We will be able to use more AI
                and other technologies without having to buy new computers,
                because they are running on the cloud. You can see this movement
                already today, when you look at the rise of Artificial
                Intelligence like GPT-3. We will also be able to use more energy
                efficient technologies, because we will be able to produce more
                energy. I think the internet will also play a big role in the
                future of space travel. If humankind is going to get
                multiplanetary, we will need to use the internet to communicate
                with each other and to share data, even across different
                planets. Installing software will become more and more
                unpopular, because we will be able to use the internet to run
                our software. A new technology that will deal as a Gamechanger
                is Webassembly. Webassembly is a new technology that allows you
                to run code in the browser. This means that you can run code in
                the browser that was not written in JavaScript. This will allow
                us to use more languages in the browser, which will make it
                easier to use more powerful languages like Rust or C++.
                <br />
                <br />
                For the Enduser, I think argumented reality will become a big
                role. For example to fix cars. You will be able to see the
                problem in the car and fix it with the help of a virtual
                assistant. I think the internet will also play a big role in the
                future of education. We will be able to learn more and faster,
                because we will be able to use Artifical Intelligence for our
                children. I think the internet will also play a big role in the
                future of medicine. We will be able to diagnose diseases faster
                and more accurate. You don't need to go to the doctor anymore,
                because you can use the internet to diagnose yourself with a
                computer that is controlled over the cloud, extemely fast and
                developed to recognize diseases.
                <br />
                <br />I am very excited about the future of the internet and I
                am looking forward to see what the next stage of the internet
                will look like.
              </p>
            </article>
          </>
        }
      />
    </>
  );
}
