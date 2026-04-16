"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./banner.scss";

// Helper function to create arrays with mapped values
const mapUpToSum = (num, fn) => {
  const res = [];
  for (let i = 0; i < num; i++) res.push(fn(i, res));
  return res;
};

// Helper function to generate a mask around the title area
const generateCols = (n, m, centerX, centerY, maskRadius, randomize, committee) =>
  mapUpToSum(n, i => (
    <div className="square-col" key={i}>
      {mapUpToSum(m, j => {
        const classNames = ["square"];

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

        if (isMasked) {
          classNames.push("white");
        } else if (randomize) {
          const r = Math.random();
          // 3% chance: render logo image
          if (r < 0.03) {
            classNames.push("logo-bg");
            return (
              <div
                className={classNames.join(" ")}
                key={j}
                style={{ "--logo-url": `url(/committees/interior/${committee}.png)` }}
              />
            );
          }
          else if (r < 0.11) classNames.push("white"); // %11- %3 chance to get empty
          else if (r < 0.43) classNames.push("light"); // %43 - %11 chance to get light
        }

        return <div className={classNames.join(" ")} key={j} />;
      })}
    </div>
  ));

/**
 * @param {{ decorative?: boolean, sideCols?: number, height?: number, width?: number }} props
 */
function Banner({ decorative = false, sideCols: sideColsProp, height: heightProp, width: widthProp = 5 }) {
  const [randomize, setRandomize] = useState(false);
  const [color, setColor] = useState(0);
  const [currentCommittee, setCurrentCommittee] = useState("acm");
  const [dimensions, setDimensions] = useState(() => {
    let sideCols = sideColsProp || (decorative ? 12 : 9);
    let height = heightProp || (decorative ? 2 : 7);

    if (height % 2 === 0) {
      height += 1;
    }
    if (sideCols % 2 === 0) {
      sideCols += 1;
    }

    return { sideCols, height };
  });

  const committees = React.useMemo(() => {
    const base = ["studio", "icpc", "design", "cyber", "teachla", "w", "ai", "hack", "cloud"];
    // Shuffle base:
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    return ["acm", ...base];
  }, []);

  useEffect(() => {
    // Initialize randomize state
    setRandomize(true);

    // Get all banner elements
    const elements = document.querySelectorAll(".banner");

    // Set up color cycling interval
    const id = setInterval(() => {
      setColor(prev => {
        // Calculate next color index
        const next = (prev + 1) % committees.length;
        setCurrentCommittee(committees[next]);

        // Remove the previous class from all banners
        // Add the new class to all banners
        elements.forEach(el => {
          el.classList.remove(committees[prev]);
          el.classList.add(committees[next]);
        });

        return next;
      });
    }, 4000);

    // Clean up interval on unmount
    return () => clearInterval(id);
  }, [decorative, committees]);
  const width = widthProp;
  const { sideCols, height } = dimensions;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hypotenuse = Math.sqrt(
      0.6 * window.innerWidth * 0.6 * window.innerWidth + window.innerHeight * window.innerHeight
    );

    let nextSideCols =
      sideColsProp ||
      (decorative
        ? 12
        : window.innerHeight > window.innerWidth * 0.6
          ? Math.floor(window.innerWidth * 0.03)
          : Math.floor(window.innerWidth * 0.0165));

    let nextHeight =
      heightProp ||
      (decorative
        ? 2
        : window.innerHeight > window.innerWidth * 0.6
          ? Math.floor(hypotenuse / 42)
          : Math.floor(hypotenuse / 54));

    // Make dimensions odd
    if (nextHeight % 2 === 0) {
      nextHeight += 1;
    }
    if (nextSideCols % 2 === 0) {
      nextSideCols += 1;
    }

    setDimensions(prev => {
      if (prev.sideCols === nextSideCols && prev.height === nextHeight) return prev;
      return { sideCols: nextSideCols, height: nextHeight };
    });
  }, [decorative, heightProp, sideColsProp]);

  // Calculate the center for the mask
  const centerX = Math.floor(sideCols / 2);
  const centerY = Math.floor(height / 2);

  return (
    <div className={`banner ${decorative ? "decorative" : ""} ${currentCommittee}`}>
      <div key={`${sideCols}-${height}`} className="square-col-container">
        {!decorative && generateCols(sideCols, height, centerX, centerY, 2, randomize, currentCommittee)}
        {decorative && generateCols(8, 4, undefined, undefined, 2, randomize, currentCommittee)}
      </div>
      {!decorative && (
        <div className="title">
          <h1>code the future.</h1>
        </div>
      )}
    </div>
  );
}

Banner.propTypes = {
  decorative: PropTypes.bool,
  sideCols: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default Banner;
