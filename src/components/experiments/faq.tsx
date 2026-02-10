import { cn } from "@/lib/utils";
import { useState } from "react";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);
  const faq = [
    {
      question: "What are your capabilities as an AI assistant?",
      answer:
        "As an AI assistant, I can help with a wide range of tasks including answering questions, generating content, providing recommendations, explaining complex topics, and assisting with problem-solving. I'm designed to understand natural language, maintain context throughout conversations, and provide helpful, accurate information across various domains of knowledge.",
    },
    {
      question: "How do you process my questions?",
      answer:
        "I process your questions using natural language understanding models that analyze the text to determine your intent. I don't have personal experiences or emotions, but I'm trained on vast datasets to recognize patterns and generate appropriate responses. When you ask a question, I work to understand the context and provide the most relevant and helpful answer possible.",
    },
    {
      question: "Can you remember our previous conversations?",
      answer:
        "Within a single session, I can maintain context and refer back to our previous exchanges. This helps me provide more coherent and relevant responses as our conversation progresses. However, I don't permanently store conversations or build a persistent memory of users between different sessions unless specifically designed to do so by the platform I'm integrated with.",
    },
    {
      question: "How do you handle information you're uncertain about?",
      answer:
        "When I encounter information I'm uncertain about, I try to acknowledge my limitations and be transparent. I avoid making definitive claims on topics where my knowledge might be limited or outdated. In such cases, I might suggest seeking additional information from more authoritative sources or indicate the boundaries of my understanding on the subject.",
    },
    {
      question: "What are your limitations?",
      answer:
        "I have several limitations. My knowledge has a training cutoff date, so I may not have information about recent events. I can't browse the web independently, run code, or access external systems unless specifically integrated with those capabilities. I also don't have personal experiences, emotions, or consciousness. There are certain sensitive topics I'm designed to avoid or handle with care to ensure I'm providing helpful and responsible assistance.",
    },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center max-w-xl mx-auto">
      <div className="w-full select-none">
        {faq.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="w-full flex-1/2 flex flex-col gap-2 transition-all cursor-pointer border-b overflow-hidden border-primary"
          >
            <div className="group rounded-lg my-px font-mono">
              <div className="[mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] p-4">
                <div className={cn("flex items-center justify-between", activeIndex === index && "mt-2")}>
                  <h2 className="font-semibold text-ms transition-all duration-500">{item.question}</h2>
                  <div className="relative w-3 h-3">
                    <div
                      className={cn(
                        "absolute w-0.5 h-full bg-text-primary rounded-full transition-all duration-500 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2",
                        activeIndex === index ? "rotate-[90deg]" : "rotate-0",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute w-0.5 h-full bg-text-primary rotate-90 rounded-full transition-all duration-1000 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2",
                        activeIndex === index ? "rotate-[270deg]" : "rotate-90",
                      )}
                    />
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs leading-relaxed tabular-nums font-medium text-tertiary transition-all duration-500",
                    activeIndex === index
                      ? "max-h-72 mt-2 mb-2 opacity-100"
                      : "max-h-0 group-hover:max-h-10 opacity-0 group-hover:opacity-100 group-hover:mt-2 overflow-hidden [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]",
                  )}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
