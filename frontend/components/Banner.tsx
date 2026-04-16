"use client";

import { useState, useEffect, useMemo } from "react";

function Square({
  i,
  j,
  centerX,
  centerY,
  randomize,
  committee,
}: {
  i: number;
  j: number;
  centerX: number;
  centerY: number;
  randomize: boolean;
  committee: string;
}) {
  const classNames = [
    // "bg-acm-cobalt",
    "w-[50px]",
    "h-[50px]",
    "mb-[6px]",
    "rounded-[14px]",
    "[transition:background_2.5s_ease-in-out]",
  ];

  // Check if the square is within the masked area
  const diamondMask = new Set([
    "-3,-1",
    "-3,0",
    "-2,-1",
    "-2,0",
    "-2,1",
    "-1,-1",
    "-1,0",
    "-1,1",
    "0,-1",
    "0,0",
    "0,1",
    "1,-1",
    "1,0",
    "1,1",
    "2,0",
    "2,1",
  ]);

  const dx = i - centerX;
  const dy = j - centerY;
  const isMasked = diamondMask.has(`${dx},${dy}`);

  const stylesObject: Record<string, string> = {};
  const committeeItself = committee.split("-")[0];

  if (isMasked) {
    classNames.push("bg-transparent");
  } else if (randomize) {
    const r = Math.random();
    // 3% chance: render logo image
    if (r < 0.03) {
      classNames.push(`bg-${committee} logo-bg relative overflow-hidden`);
      // hasLogo = true;
      stylesObject["--logo-url"] = `url(/committees/interior/${committee.split("-")[0]}.png)`;
    } else if (r < 0.11) {
      classNames.push("bg-transparent"); // %11- %3 chance to get empty
    } else if (r < 0.43) {
      // console.log(`bg-${committeeItself}-tint`);
      classNames.push(`bg-${committeeItself}-tint`); // %43 - %11 chance to get light
    } else {
      classNames.push(`bg-${committee}`); // rest chance to get full color
    }
  }

  return (
    <div
      className={classNames.join(" ")}
      // @ts-ignore
      style={stylesObject}
      key={j}
    />
  );
}

function Banner(props: { decorative?: boolean; sideCols?: number; height?: number; width?: number }) {
  const { decorative, sideCols, height, width } = props;

  const [randomize, setRandomize] = useState(false);
  const [color, setColor] = useState(0);
  const [currentCommittee, setCurrentCommittee] = useState("acm-cobalt");

  // const [sideColsState, setSideColsState] = useState(sideCols || 0);
  // const [heightState, setHeightState] = useState(height || 0);
  // const [centerX, setCenterX] = useState(0);
  // const [centerY, setCenterY] = useState(0);

  const [children, setChildren] = useState<any>();

  const committees = useMemo(() => {
    const base = [
      "studio-raspberry",
      "icpc-tangerine",
      "design-orange",
      "cyber-amber",
      "teachla-green",
      "w-teal",
      "ai-arctic",
      "hack-purple",
      "cloud-purple",
    ];
    // Shuffle base:
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    return ["acm-cobalt", ...base];
  }, []);

  useEffect(() => {
    // Initialize randomize state
    setRandomize(true);

    // Set up color cycling interval
    const id = setInterval(() => {
      setColor(prev => {
        // Calculate next color index
        const next = (prev + 1) % committees.length;
        setCurrentCommittee(committees[next]);

        return next;
      });
    }, 4000);

    // Clean up interval on unmount
    return () => clearInterval(id);
  }, [decorative, committees]);

  /*
  useLayoutEffect(() => {
    // Get dimensions of login-tile element if it exists
    const hypotenuse = Math.sqrt(
      0.6 * window.innerWidth * 0.6 * window.innerWidth + window.innerHeight * window.innerHeight
    );

    // console.log(hypotenuse);

    // Configure banner properties based on decorative flag
    if (sideColsState === 0) {
      setSideColsState(
        decorative
          ? 12
          : window.innerHeight > window.innerWidth * 0.6
            ? Math.floor(window.innerWidth * 0.03)
            : Math.floor(window.innerWidth * 0.0165)
      );
    }
    if (heightState === 0) {
      setHeightState(
        decorative
          ? 2
          : window.innerHeight > window.innerWidth * 0.6
            ? Math.floor(hypotenuse / 42)
            : Math.floor(hypotenuse / 54)
      );
    }

    // console.log(sideColsState, heightState);

    // Make dimensions odd
    if (heightState % 2 === 0) {
      setHeightState(prev => {
        setCenterY(Math.floor((prev + 1) / 2));
        return prev + 1;
      });
    } else {
      setCenterY(Math.floor(heightState / 2));
    }
    if (sideColsState % 2 === 0) {
      setSideColsState(prev => {
        setCenterX(Math.floor((prev + 1) / 2));
        return prev + 1;
      });
    } else {
      setCenterX(Math.floor(sideColsState / 2));
    }
    // Calculate the center for the mask
    // setCenterX(Math.floor(sideColsState / 2));
    // setCenterY(Math.floor(heightState / 2));

    // console.log(sideColsState, heightState, centerX, centerY);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  */

  useEffect(() => {
    const hypotenuse = Math.sqrt(
      0.6 * window.innerWidth * 0.6 * window.innerWidth + window.innerHeight * window.innerHeight
    );

    // Configure banner properties based on decorative flag
    const tempDecorative = decorative || false;
    let tempSideCols =
      sideCols ||
      (tempDecorative
        ? 12
        : window.innerHeight > window.innerWidth * 0.6
          ? Math.floor(window.innerWidth * 0.03)
          : Math.floor(window.innerWidth * 0.0165));
    let tempHeight =
      height ||
      (tempDecorative
        ? 2
        : window.innerHeight > window.innerWidth * 0.6
          ? Math.floor(hypotenuse / 42)
          : Math.floor(hypotenuse / 54));

    // Make dimensions odd
    if (tempHeight % 2 === 0) {
      tempHeight += 1;
    }
    if (tempSideCols % 2 === 0) {
      tempSideCols += 1;
    }

    // Calculate the center for the mask
    const centerX = Math.floor(tempSideCols / 2);
    const centerY = Math.floor(tempHeight / 2);

    setChildren(
      decorative ? (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="h-full mx-3.5 -my-[175px] px-[5px] py-0 rotate-45 w-[50px]" key={i}>
              {Array.from({ length: 4 }).map((__, j) => (
                <Square
                  i={i}
                  j={j}
                  centerX={-100}
                  centerY={-100}
                  randomize={randomize}
                  committee={currentCommittee}
                  key={j}
                />
              ))}
            </div>
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: tempSideCols }).map((_, i) => (
            <div
              className="h-full mx-3.5 -my-[300px] px-[5px] py-0 rotate-45 w-[50px] max-[500px]:-my-[100px] max-[500px]:mx-2.5 max-[800px]:-my-[175px] max-[800px]:mx-2.5"
              key={i}>
              {Array.from({ length: tempHeight }).map((__, j) => (
                <Square
                  i={i}
                  j={j}
                  centerX={centerX}
                  centerY={centerY}
                  randomize={randomize}
                  committee={currentCommittee}
                  key={j}
                />
              ))}
            </div>
          ))}
        </>
      )
    );
  }, [decorative, sideCols, height, randomize, currentCommittee]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${decorative ? "h-[175px]" : ""}`}>
      <div className="absolute top-1/2 l-0 w-[106%] -translate-y-1/2 flex flex-row justify-center overflow-visible">
        {/* {decorative
          ? generateCols(8, 4, 0, 0, currentCommittee, 2, randomize)
          : generateCols(sideColsState, heightState, centerX, centerY, currentCommittee, 2, randomize)} */}
        {children}
      </div>
      {!decorative && (
        <div className="relative top-1/2 left-1/2 text-center w-full opacity-0 animate-[fadeIn_1.2s_ease-out_0.8s_forwards]">
          <h1
            id="banner-title"
            className={`text-${currentCommittee === "acm-cobalt" ? "white" : currentCommittee} font-[-apple-system,BlinkMacSystemFont,sans-serif] text-[2.3em] font-bold m-0 p-0 [transition:color_2.5s_ease-in-out]`}>
            code the future.
          </h1>
        </div>
      )}
    </div>
  );
}

export default Banner;
