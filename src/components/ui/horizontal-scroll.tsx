export const HorizontalScroll = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="md:w-[calc(100%+10%)] w-[calc(100%+1.5rem)] relative left-1/2 -translate-x-1/2 px-4 md:px-12 flex mb-8 gap-8 scrollbar-none py-4 items-center mask-x-from-95% overflow-x-auto">
      {children}
    </div>
  );
};
