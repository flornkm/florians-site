export default function Message({ msg, type }) {
  return (
    <>
      <div class="p-2 rounded-xl bg-[#1280EC] text-white absolute bottom-4 left-8 transition-all">
        {msg}
        <div class="absolute bottom-[-2px] left-[-8px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="16"
            viewBox="0 0 19 16"
            fill="none"
          >
            <path
              d="M1.90735e-06 14.7395C9.10227 16.3944 16.0324 11.6364 18.3597 9.05055L18.1011 1.29294C15.6014 1.81011 10.1883 2.27557 8.53338 0C8.79197 9.30914 1.81011 13.9637 1.90735e-06 14.7395Z"
              fill="#1381EE"
            />
          </svg>
        </div>
      </div>
      {/* {type === "left" && (<div class="h-[360px] flex flex-col place-items-end relative mb-4">
      <div class="p-2 rounded-xl bg-[#1280EC] text-white absolute bottom-4 left-8 transition-all">
        {msg}
        <div class="absolute bottom-[-2px] left-[-8px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="16"
            viewBox="0 0 19 16"
            fill="none"
          >
            <path
              d="M1.90735e-06 14.7395C9.10227 16.3944 16.0324 11.6364 18.3597 9.05055L18.1011 1.29294C15.6014 1.81011 10.1883 2.27557 8.53338 0C8.79197 9.30914 1.81011 13.9637 1.90735e-06 14.7395Z"
              fill="#1381EE"
            />
          </svg>
        </div>
      </div>
    </div>)}

    {type === "right" && (<div class="h-[360px] flex flex-col place-items-end relative mb-4">
      <div class="p-2 rounded-xl bg-[#1280EC] text-white absolute bottom-4 left-8 transition-all">
        {msg}
        <div class="absolute bottom-[-2px] left-[-8px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="16"
            viewBox="0 0 19 16"
            fill="none"
          >
            <path
              d="M1.90735e-06 14.7395C9.10227 16.3944 16.0324 11.6364 18.3597 9.05055L18.1011 1.29294C15.6014 1.81011 10.1883 2.27557 8.53338 0C8.79197 9.30914 1.81011 13.9637 1.90735e-06 14.7395Z"
              fill="#1381EE"
            />
          </svg>
        </div>
      </div>
    </div>)} */}
    </>
  );
}
