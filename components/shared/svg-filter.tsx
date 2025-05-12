const Dither = () => {
  return (
    <svg>
      <filter id="dither" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
        <feFlood floodColor="#000000" floodOpacity="0.50" x="0%" y="0%" result="flood" />
        <feBlend mode="normal" x="0%" y="0%" in="SourceGraphic" in2="flood" result="blend1" />
        <feImage
          className="ditherImage"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAA5ElEQVQYlQXBgQbCUABA0fdrk0ySSZJJkiRJMjOTTGZmkiRJZiYzyczMzGQmfdrtHPH7/TgcDuR5zna7pWka9vs9aZqyXq8R0+mU5/OJoihcLhfG4zFBENDtdjmdToj3+81yueTz+WCaJnEcM5/PKcsSXdcRsizjeR6j0YjH40Gr1cJxHAaDAbfbDVHXNbvdjiRJWK1WfL9fLMsiyzI2mw1CVVV836fT6XA8HplMJoRhSK/X43w+I6IoYjabURQFmqbxer1YLBZUVYVhGAhJkrBtm36/z/V6pd1u47ouw+GQ+/3OH4/Fn8FvF/NxAAAAAElFTkSuQmCC"
          x="0"
          y="0"
          width="8"
          height="8"
          crossOrigin="anonymous"
          result="image1"
        />
        <feTile x="0" y="0" in="image1" result="tile" />
        <feBlend mode="overlay" x="0%" y="0%" in="blend1" in2="tile" result="blend2" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.5 1" />
          <feFuncG type="discrete" tableValues="0 0.5 1" />
          <feFuncB type="discrete" tableValues="0 0.5 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
};

const SvgFilter = () => (
  <>
    <Dither />
  </>
);

export default SvgFilter;
