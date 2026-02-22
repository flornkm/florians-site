import countriesData from "@/assets/data/countries.json";
import { Body4 } from "@/components/design-system/body";
import { Globe } from "@/components/ui/globe";
import { VISITED_COUNTRIES, VISITED_COUNTRY_NAMES } from "../const/visited-countries";

interface GeoJSONFeature {
  type: "Feature";
  properties: { name?: string; NAME?: string; ADMIN?: string; admin?: string };
  geometry: { type: string; coordinates: number[][][] | number[][][][] };
}

const countries = countriesData.features as GeoJSONFeature[];

function getCountryName(feat: object): string {
  const f = feat as GeoJSONFeature;
  return f.properties.name || f.properties.NAME || f.properties.ADMIN || f.properties.admin || "";
}

function isCountryVisited(feat: object): boolean {
  return VISITED_COUNTRY_NAMES.has(getCountryName(feat));
}

export function GlobeTooltipContent() {
  return (
    <div className="flex flex-col items-center">
      <div className="mask-radial-[50%_55%] overflow-hidden mask-radial-from-50%">
        <Globe
          width={280}
          height={280}
          globeImageUrl="/images/earth-texture.jpg"
          showAtmosphere={false}
          globeCurvatureResolution={8}
          animateIn={false}
          animateEntrance={true}
          htmlElementsData={[]}
          polygonsData={countries}
          polygonCapColor={(feat: object) => (isCountryVisited(feat) ? "#f43f5e" : "transparent")}
          polygonSideColor={(feat: object) => (isCountryVisited(feat) ? "#e879f9" : "transparent")}
          polygonStrokeColor={(feat: object) => (isCountryVisited(feat) ? "#9f1239" : "transparent")}
          polygonAltitude={(feat: object) => (isCountryVisited(feat) ? 0.01 : 0)}
          polygonsTransitionDuration={0}
          autoRotate={true}
          autoRotateSpeed={-1.0}
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
        />
      </div>
      <div className="flex items-center gap-2 -mt-4">
        <div className="bg-rose-500 rounded-sm size-2.5" />
        <Body4 className="font-medium text-primary">{VISITED_COUNTRIES.length} visited</Body4>
      </div>
    </div>
  );
}
