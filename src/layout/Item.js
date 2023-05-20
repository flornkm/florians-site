import Link from "next/link";
import React, {
  forwardRef,
  HTMLAttributes,
  CSSProperties,
  useEffect,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import * as Icon from "react-feather";
import { Play, Pause, ClockClockwise, PersonSimpleRun } from "phosphor-react";
// import AudioPlayer from "react-h5-audio-player";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// dynamic import audio player
const AudioPlayer = dynamic(() => import("react-h5-audio-player"), {
  ssr: false,
});

const Item = forwardRef(
  ({ id, index, withOpacity, isDragging, style, ...props }, ref) => {
    const inlineStyles = {
      opacity: isDragging && 1,
      // if darkmode is not enabled, set the background color to white
      cursor: isDragging ? "grabbing" : "grab",
      boxShadow: isDragging ? "rgb(0 0 0 / 0.1) 0 2px 4px -2px" : "none",
      transform: isDragging ? "scale(1.05) rotate(-1deg)" : "none",
      backgroundSize: "cover",
      top: "0",
      objectFit: "cover",
      transformOrigin: "0 0",
      gridRow:
        index === 1 ? "span 2 / span 2" : null,
      ...style,
    };

    const storyBlock1 = React.useRef(null);
    const storyBlock2 = React.useRef(null);
    const storyBlock3 = React.useRef(null);
    const storyBlock4 = React.useRef(null);
    const storyBlock5 = React.useRef(null);

    const [emblaRef] = useEmblaCarousel({ loop: false }, [
      Autoplay({ jump: true, delay: 3000 }),
    ]);

    const imgLoader = ({ src, width, quality }) => {
      return `${src}?w=${width}&q=${quality || 75}`;
    };

    const nextWorkout = () => {
      const today = new Date().getDay();
      const nextWorkout = today === 2 ? "Workout" : today === 4 ? "Workout" : today === 6 ? "Workout" : "Rest Day";
      return nextWorkout;
    };

    useEffect(() => {
      let intervalId;
      let index = 0;
      const animationDuration = 3000; // set the duration of the animation in milliseconds
      const transition = `width ${animationDuration}ms`;

      // create an array of refs to all five story block elements
      const storyBlockRefs = [
        storyBlock1,
        storyBlock2,
        storyBlock3,
        storyBlock4,
        storyBlock5,
      ]
        .map((ref) => ref.current)
        .filter((ref) => ref !== null);

      // animate the story block elements
      const animateStoryBlock = (storyBlockRef) => {
        if (storyBlockRef) {
          storyBlockRef.style.width = "100%";
          storyBlockRef.style.transition = transition;
        }
      };

      // reset the story block elements
      const resetStoryBlocks = () => {
        storyBlockRefs.forEach((ref) => {
          if (ref) {
            ref.style.width = "0%";
            ref.style.transition = "none";
          }
        });
        index = 0;
        animateStoryBlock(storyBlockRefs[0]);
      };

      if (id === "2") {
        // start the animation cycle
        animateStoryBlock(storyBlockRefs[0]);
        intervalId = setInterval(() => {
          if (index < storyBlockRefs.length - 1) {
            // continue the animation cycle
            animateStoryBlock(storyBlockRefs[index + 1]);
            index++;
          } else {
            // end the animation cycle and reset the story block elements
            storyBlockRefs[0].style.transition = "none"; // remove the transition for the first element
            storyBlockRefs[0].style.width = "0%"; // set the width of the first element to 0%
            resetStoryBlocks();
          }
        }, animationDuration);
      }

      return () => {
        clearInterval(intervalId);
        resetStoryBlocks();
      };
    }, []);

    return (
      (id === "1" && (
        <div
          ref={ref}
          style={inlineStyles}
          className={
            "max-md:row-span-1 overflow-hidden relative w-full h-full items-center justify-center flex rounded-xl max-md:min-h-[300px] "
            + (withOpacity ? "bg-zinc-100 dark:bg-black" : "bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800")
          }
          {...props}
        >
          <div className="opacity-100 hover:opacity-80 transition-all flex items-center justify-center h-full w-full object-cover')]" style={{ opacity: withOpacity ? "0" : "1" }}>
            <div className="absolute h-8 w-8 rounded-full z-10 border-4 border-white bg-blue-500 shadow-lg" />
            <div className="absolute h-8 w-8 rounded-full bg-blue-500 shadow-lg animate-ping" />
            <div className="absolute inset-0 bg-transparent z-10 shadow-zinc-50" />
            <Image
              loader={imgLoader}
              src="/images/maps.jpg"
              alt="Maps Background"
              className="h-full w-full object-cover pointer-events-none"
              width={500}
              height={400}
            />
          </div>
          {!withOpacity && <Icon.Globe
            size={40}
            className="p-2 shadow-sm bg-gradient-to-t from-green-500 to-emerald-500 text-white rounded-lg absolute top-2 right-2 z-30"
          />}
        </div>
      )) ||
      (id === "2" && (
        <div
          ref={ref}
          style={inlineStyles}
          className={
            "max-md:row-span-1 overflow-hidden relative w-full h-full items-center justify-center flex rounded-xl max-md:min-h-[300px] "
            + (withOpacity ? "bg-zinc-100 dark:bg-black" : "bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800")
          }
          {...props}
        >
          {withOpacity && <div className="absolute top-0 bottom-0 left-0 right-0 z-50 bg-zinc-100 dark:bg-black" />}
          {!withOpacity && <div className="w-full h-full">
            <div className="grid grid-cols-5 gap-1 h-2 w-full absolute top-2 z-10 left-2 pr-16">
              <div className="h-2 w-full bg-white bg-opacity-50 rounded-full backdrop-blur-xl overflow-hidden">
                <div
                  className="bg-white bg-opacity-50 h-full transition-all duration-[3000ms] w-0"
                  ref={storyBlock1}
                ></div>
              </div>
              <div className="h-2 w-full bg-white bg-opacity-50 rounded-full backdrop-blur-xl overflow-hidden">
                <div
                  className="bg-white bg-opacity-50 h-full transition-all duration-[3000ms] w-0"
                  ref={storyBlock2}
                ></div>
              </div>
              <div className="h-2 w-full bg-white bg-opacity-50 rounded-full backdrop-blur-xl overflow-hidden">
                <div
                  className="bg-white bg-opacity-50 h-full transition-all duration-[3000ms] w-0"
                  ref={storyBlock3}
                ></div>
              </div>
              <div className="h-2 w-full bg-white bg-opacity-50 rounded-full backdrop-blur-xl overflow-hidden">
                <div
                  className="bg-white bg-opacity-50 h-full transition-all duration-[3000ms] w-0"
                  ref={storyBlock4}
                ></div>
              </div>
              <div className="h-2 w-full bg-white bg-opacity-50 rounded-full backdrop-blur-xl overflow-hidden">
                <div
                  className="bg-white bg-opacity-50 h-full transition-all duration-[3000ms] w-0"
                  ref={storyBlock5}
                ></div>
              </div>
            </div>
            <div
              className="embla overflow-hidden w-full h-full pointer-events-none"
              ref={emblaRef}
              draggable={false}
            >
              <div className="embla__container flex h-full w-full gap-0">
                <div className="embla__slide flex-[0_0_100%] w-full min-w-0 bg-cover bg-[url('/images/slider/photo_arduino.jpg')] bg-center"></div>
                <div className="embla__slide flex-[0_0_100%] w-full min-w-0 bg-cover bg-[url('/images/slider/photo_bakery.jpg')] bg-center"></div>
                <div className="embla__slide flex-[0_0_100%] w-full min-w-0 bg-cover bg-[url('/images/slider/photo_church.jpg')] bg-center"></div>
                <div className="embla__slide flex-[0_0_100%] w-full min-w-0 bg-cover bg-[url('/images/slider/photo_croatia.jpg')] bg-center"></div>
                <div className="embla__slide flex-[0_0_100%] w-full min-w-0 bg-cover bg-[url('/images/slider/photo_room.jpg')] bg-center"></div>
              </div>
            </div>
            <Icon.Image
              size={40}
              className="p-2 shadow-sm bg-gradient-to-t from-purple-500 to-violet-500 text-white rounded-lg absolute top-2 right-2"
            />
          </div>}
        </div>
      )) ||
      (id === "3" && (
        <div
          ref={ref}
          style={inlineStyles}
          className={
            "max-md:row-span-1 relative p-8 w-full h-full items-center justify-center flex rounded-xl max-md:min-h-[300px] "
            + (withOpacity ? "bg-zinc-100 dark:bg-black" : "bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800")
          }
          {...props}
        >
          <div className="w-full h-full pr-12" style={{ opacity: withOpacity ? 0 : 1 }}>
            <p className="font-display text-lg mb-3">Youtube channels I recommend:</p>
            <div className="flex flex-col gap-2 flex-nowrap items-start">
              <Link className="font-display transition-all text-black border-b-black group dark:text-white hover:bg-zinc-200 hover:bg-opacity-75 dark:hover:bg-zinc-800 rounded-md" href="https://www.youtube.com/@CodeAesthetic" target="_blank">- CodeAesthetic
                <Icon.ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                />
              </Link>
              <Link className="font-display transition-all text-black border-b-black group dark:text-white hover:bg-zinc-200 hover:bg-opacity-75 dark:hover:bg-zinc-800 rounded-md" href="https://www.youtube.com/@AZisk" target="_blank">- Alex Ziskind
                <Icon.ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                />
              </Link>
              <Link className="font-display transition-all text-black border-b-black group dark:text-white hover:bg-zinc-200 hover:bg-opacity-75 dark:hover:bg-zinc-800 rounded-md" href="https://www.youtube.com/@Fireship" target="_blank">- Fireship
                <Icon.ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                />
              </Link>
            </div>
          </div>
          {!withOpacity && <Icon.Paperclip
            size={40}
            className="p-2 shadow-sm bg-gradient-to-t from-blue-500 to-sky-500 text-white rounded-lg absolute top-2 right-2"
          />}
        </div>
      )) ||
      (id === "4" && (
        <div
          ref={ref}
          style={inlineStyles}
          className={
            "max-md:row-span-1 p-2 relative w-full h-full items-center justify-center flex flex-col gap-4 rounded-xl max-md:min-h-[300px] "
            + (withOpacity ? "bg-zinc-100 dark:bg-black" : "bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800")
          }
          {...props}
        >
          <AudioPlayer
            autoPlay
            src={[
              "https://dl.dropboxusercontent.com/s/lxkyij9yfjak571/SyncHits-Toast_Hawaii.wav?dl=0",
              "https://dl.dropboxusercontent.com/s/vulp6kww2230if1/Fashion-Lounge.wav?dl=0",
            ]}
            autoPlayAfterSrcChange={false}
            autoPlay={false}
            customVolumeControls={[]}
            customAdditionalControls={[]}
            showDownloadProgress={false}
            style={{
              opacity: withOpacity ? 0 : 1,
            }}
            customIcons={{
              play: (
                <Play size={32} className="text-white" weight="fill" />
              ),
              pause: (
                <Pause size={32} className="text-white" weight="fill" />
              ),
            }}
            showJumpControls={false}
          />
          {!withOpacity && <Icon.Music
            size={40}
            className="p-2 shadow-sm bg-gradient-to-t from-red-500 to-rose-500 text-white rounded-lg absolute top-2 right-2"
          />}
        </div>
      )) || (id === "5" && (
        <div
          ref={ref}
          style={inlineStyles}
          className={
            "max-md:row-span-1 p-2 relative w-full h-full items-center justify-center flex flex-col gap-4 rounded-xl max-md:min-h-[300px] "
            + (withOpacity ? "bg-zinc-100 dark:bg-black" : "bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800")
          }
          {...props}
        >
          {!withOpacity && <div className="h-full w-full flex flex-col gap-2 justify-start p-2">
            <p className="text-xs text-zinc-700 absolute top-4 left-4 dark:text-zinc-300">Todays activity</p>
            <div className="h-full flex-col w-full flex items-center justify-center">
              {nextWorkout() === "Rest Day" ? <Image className="w-32" src="/images/memoji/memoji_rest.png" alt="Florian Rest" width={96} height={96} /> : <Image className="w-32" src="/images/memoji/memoji_workout.png" alt="Florian Workout" width={96} height={96} />}
              <p className="text-base text-center font-medium"><br /> {nextWorkout()}</p>
            </div>
          </div>}
          {!withOpacity && <Icon.Activity
            size={40}
            className="p-2 shadow-sm bg-gradient-to-t from-amber-500 to-yellow-500 text-white rounded-lg absolute top-2 right-2"
          />}
        </div>
      )) ||
      (id !== "1" && (
        <div
          ref={ref}
          style={inlineStyles}
          className={
            "max-md:row-span-1 border-zinc-200 relative bg-zinc-50 border w-full h-full items-center justify-center flex rounded-xl"
          }
          {...props}
        >
          {id}
        </div>
      ))
    );
  }
);

export default Item;
