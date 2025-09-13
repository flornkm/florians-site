import { Body1 } from "@/components/design-system/body";
import { H2 } from "@/components/design-system/heading";

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4">
      <section className="w-full max-w-80">
        <H2 className="mb-4">Privacy Policy</H2>
        <Body1>
          This is a personal site and contains links to other websites (just as any other website).
          <br />
          It doesn't specifically track any personal data (besides storing information of users using the letters
          interaction).
          <br />
          <br />
          Privacy requests won't be answered as this site doesn't earn revenue.
        </Body1>
      </section>
    </div>
  );
}
