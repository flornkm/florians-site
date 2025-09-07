import { Clone } from "@/components/shared/clone/Clone";

export default function Page() {
  return (
    <div className="grid min-h-screen w-screen relative left-1/2 -translate-x-1/2 grid-cols-5 mx-auto">
      <div className="w-full col-span-2 h-full flex items-center justify-center">
        <Clone />
      </div>
    </div>
  );
}
