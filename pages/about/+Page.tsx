import { InlineInfo } from "../../interface/components/Inline"
import Tooltip from "../../interface/components/Tooltip"

export const documentProps = {
  title: "About Florian",
}

export default function Page() {
  return (
    <div class="w-full">
      <section class="w-full lg:pt-24 pt-16 flex gap-12 lg:flex-row flex-col">
        <div class="max-w-[170px] w-full flex-shrink-0">
          <img
            src="/images/avatars/florian_student.webp"
            class="aspect-square rounded-full"
          />
        </div>
        <div class="flex-grow max-w-md">
          <h1 class="text-xl font-semibold mb-3">About Florian</h1>
          <p class="text-zinc-500 mb-4">
            Born on the 11th of January, 2001 in{" "}
            <InlineInfo>
              Southern Germany{" "}
              <Tooltip position="top" class="-translate-y-2">
                Ravensburg, BW
              </Tooltip>
            </InlineInfo>{" "}
            I was part of the first generation getting adults in the age of
            computers, mobile phones and advanced technoloy.
          </p>
          <p class="text-zinc-500 mb-4">
            Quickly I've got used to working with computers and in 2013, I began
            making money in the internet with selling my skills as a
            <InlineInfo>
              digital Designer{" "}
              <Tooltip position="top" class="-translate-y-2">
                I also edited videos
              </Tooltip>
            </InlineInfo>
            .
          </p>
          <p class="text-zinc-500 mb-4">
            Now, {new Date().getFullYear() - 2013} years later, I have learned
            coding in addition, opening whole new possibilites for people and
            companies I work with. The job title I love using for this unique
            field is:
            <br />
            <span class="font-medium text-zinc-600">Design Engineer</span>.
          </p>
        </div>
        {/* <div class="max-w-s w-full flex-shrink-0 bg-zinc-100 h-24 lg:ml-auto" /> */}
      </section>
    </div>
  )
}
