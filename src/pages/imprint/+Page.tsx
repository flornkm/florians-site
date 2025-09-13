import { Body1 } from "@/components/design-system/body";
import { H2 } from "@/components/design-system/heading";

export default function Page() {
  return (
    <div className="w-full max-w-5xl mx-auto md:px-0 px-4">
      <section className="w-full max-w-80">
        <H2 className="mb-4">Imprint</H2>
        <Body1>
          Florian Kiem <br />
          IFZA Business Park, DDP <br />
          63615 - 001, Dubai <br />
          UAE <br />
        </Body1>
      </section>
    </div>
  );
}
