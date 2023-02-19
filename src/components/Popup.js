import Image from "next/image";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, useRef } from "react";
import * as Icon from "react-feather";
import useEmblaCarousel from "embla-carousel-react";

export default function Popup({
  collaborators,
  popupState,
  setPopupState,
  icon,
  name,
  shortDescription,
  mainImages,
  text,
  links,
}) {
  let [isOpen, setIsOpen] = useState(true);
  const imgLoader = ({ src, width, quality }) => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  let completeButtonRef = useRef(null)

  function closeModal() {
    setIsOpen(false);
    setPopupState(false);
  }

  useEffect(() => {
    if (popupState) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [popupState]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  });

  useEffect(() => {
    if (emblaApi) {
      // Embla API is ready
    }
  }, [emblaApi]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal} initialFocus={completeButtonRef}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          {name && (
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-5xl transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                    <div className="overflow-y-auto max-h-[70vh] p-6 max-md:max-h-[60vh]">
                      <div className="flex w-full place-items-center justify-between max-md:flex-col pr-20 max-md:items-start max-md:gap-8">
                        <div className="flex gap-6 place-items-center">
                          <Image
                            loader={imgLoader}
                            src={icon}
                            width={88}
                            height={88}
                            alt={name}
                            className="rounded-2xl"
                          />
                          <div>
                            <Dialog.Title
                              as="h3"
                              className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white"
                            >
                              {name}
                            </Dialog.Title>
                            <div className="mt-2">
                              <p className="text-gray-500">
                                {shortDescription}
                              </p>
                            </div>
                          </div>
                        </div>
                        {collaborators && (
                          <div className="flex gap-4 place-items-center">
                            {collaborators.includes("Anton") && (
                              <Link
                                href={"https://www.antonstallboerger.com/"}
                                target="_blank"
                                className="group relative transition-all"
                              >
                                <div className="absolute flex justify-center pb-1 pt-1 pl-3 pr-3 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover:opacity-100 group-hover:bottom-[125%] transition-all bg-black text-white rounded-full w-max text-sm ease-in-out duration-200 dark:bg-white dark:text-black">
                                  <span className="z-10 relative">
                                    Anton Stallbörger
                                  </span>
                                  <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
                                </div>
                                <Image
                                  loader={imgLoader}
                                  src="./images/collaborator_anton_stallboerger.jpg"
                                  alt="Anton Stallbörger"
                                  className="inline-flex ring-1 ring-gray-300 object-cover object-center max-h-128 rounded-full"
                                  width={48}
                                  height={48}
                                />
                              </Link>
                            )}
                            {collaborators.includes("Nils") && (
                              <Link
                                href={"https://www.nilseller.com/"}
                                target="_blank"
                                className="group relative transition-all"
                              >
                                <div className="absolute flex justify-center pb-1 pt-1 pl-3 pr-3 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover:opacity-100 group-hover:bottom-[125%] transition-all bg-black text-white rounded-full w-max text-sm ease-in-out duration-200 dark:bg-white dark:text-black">
                                  <span className="z-10 relative">
                                    Nils Eller
                                  </span>
                                  <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
                                </div>
                                <Image
                                  loader={imgLoader}
                                  src="./images/collaborator_nils_eller.jpg"
                                  alt="Nils Eller"
                                  className="inline-flex ring-1 ring-gray-300 object-cover object-center max-h-128 rounded-full"
                                  width={48}
                                  height={48}
                                />
                              </Link>
                            )}
                            {collaborators.includes("Alice") && (
                              <Link
                                href={"#"}
                                className="group relative transition-all"
                              >
                                <div className="absolute flex justify-center pb-1 pt-1 pl-3 pr-3 left-[50%] translate-x-[-50%] bottom-[120%] opacity-0 group-hover:opacity-100 group-hover:bottom-[125%] transition-all bg-black text-white rounded-full w-max text-sm ease-in-out duration-200 dark:bg-white dark:text-black">
                                  <span className="z-10 relative">
                                    Alice Sopp
                                  </span>
                                  <div className="w-3 h-3 absolute -bottom-1 bg-black rotate-45 dark:bg-white"></div>
                                </div>
                                <Image
                                  loader={imgLoader}
                                  src="./images/collaborator_alice_sopp.jpg"
                                  alt="Alice Sopp"
                                  className="inline-flex ring-1 ring-gray-300 object-cover object-center max-h-128 rounded-full"
                                  width={48}
                                  height={48}
                                />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="embla py-6 cursor-grab" ref={emblaRef}>
                        <div className="embla__container">
                          {mainImages &&
                            mainImages.map((mainImage, index) => (
                              <div
                                key={index}
                                className="embla__slide max-md:pr-2"
                              >
                                <div className="embla__slide__inner">
                                  <Image
                                    className="rounded-none max-h-96 object-cover w-full"
                                    loader={imgLoader}
                                    src={mainImage}
                                    width={1000}
                                    height={500}
                                    alt={name}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                      <h3 className="text-xl font-medium mb-1 dark:text-white">About</h3>
                      <p className="text-gray-700 dark:text-gray-300">{text}</p>
                      {links && (
                        <div className="mt-10">
                          <div className="flex w-full justify-between p-4 bg-gray-100 rounded-lg place-items-center max-sm:place-items-start max-sm:flex-col max-sm:gap-8 dark:bg-gray-700">
                            <div className="flex gap-4 max-sm:flex-col max-sm:items-start">
                              {links.map((link) => (
                                <Link
                                  className="font-medium text-lg transition-all text-black hover:opacity-75 border-b-black group dark:text-white"
                                  href={link.url}
                                  target="_blank"
                                >
                                  {link.text}
                                  <Icon.ArrowUpRight
                                    size={20}
                                    className="inline ml-0.5 relative group-hover:-right-1 group-hover:-top-1.5 right-0 -top-0.5 transition-all"
                                  />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        ref={completeButtonRef}
                        className="flex w-10 h-10 justify-center place-items-center rounded-full border border-transparent bg-black text-white absolute text-sm font-medium hover:bg-gray-900 focus:outline-none right-2 top-2 dark:bg-white dark:hover:bg-gray-100 dark:text-black"
                        onClick={() => {
                          setPopupState(false);
                          setIsOpen(false);
                        }}
                      >
                        <Icon.X size={24} />
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          )}
        </Dialog>
      </Transition>
    </>
  );
}