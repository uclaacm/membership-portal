import React, { useState, useEffect } from 'react';
import './banner.scss';

// Helper function to create arrays with mapped values
const mapUpToSum = (num, fn) => {
  const res = [];
  for (let i = 0; i < num; i++) res.push(fn(i, res));
  return res;
};

// Helper function to generate a mask around the title area
const generateCols = (n, m, centerX, centerY, maskRadius = 2, randomize = false) => {
  return mapUpToSum(n, (i) => (
    <div className="square-col" key={i}>
      {mapUpToSum(m, (j) => {
        const classNames = ['square'];
        
        // Check if the square is within the masked area
        const diamondMask = new Set([
          '-3,-1','-3,0',
          '-2,-1','-2,0','-2,1',
          '-1,-1','-1,0','-1,1',            
          '0,-1','0,0','0,1',   
          '1,-1','1,0','1,1',
          '2,0','2,1',
        ]);

        const dx = i - centerX;
        const dy = j - centerY;
        const isMasked = diamondMask.has(`${dx},${dy}`);

        if (isMasked) {
          classNames.push('white');
        } else if (randomize) {
          const r = Math.random();
          if (r < 0.08) classNames.push('white');
          else if (r < 0.4) classNames.push('light');
        }

        return <div className={classNames.join(' ')} key={j} />;
      })}
    </div>
  ));
};

const Banner = (props) => {
  const [randomize, setRandomize] = useState(false);
  const [color, setColor] = useState(0);
  let timer;

  useEffect(() => {
    // Initialize randomize state
    setRandomize(true);

    // Define committee colors to cycle through
    const committees = ['acm'];
    committees.push(
      'studio',
      'icpc',
      'design',
      'cyber',
      'teachla',
      'w',
      'ai',
      'hack',
    );

    // Get all banner elements
    const elements = document.querySelectorAll('.banner');
    
    // Set up color cycling interval
    const id = setInterval(() => {
      setColor((prev) => {
        // Remove the previous class from all banners
        elements.forEach(el => {
          el.classList.remove(committees[prev]);
        });

        // Calculate next color index
        const next = (prev + 1) % committees.length;

        // Add the new class to all banners
        elements.forEach(el => {
          el.classList.add(committees[next]);
        });

        return next;
      });
    }, 4000);

    // Clean up interval on unmount
    return () => clearInterval(id);
  }, [props.decorative]);
  // Get dimensions of login-tile element if it exists
  const hypotenuse = Math.sqrt(0.6 * window.innerWidth * 0.6 * window.innerWidth + window.innerHeight * window.innerHeight);
  
  // Configure banner properties based on decorative flag
  const decorative = props.decorative || false;
  let sideCols = props.sideCols || (decorative ? 12 : (window.innerHeight > window.innerWidth * 0.6 ? Math.floor(window.innerWidth * 0.03) : Math.floor(window.innerWidth * 0.0165)));
  let height = props.height || (decorative ? 2 : (window.innerHeight> window.innerWidth * 0.6 ? Math.floor(hypotenuse / 42) : Math.floor(hypotenuse / 54)));
  const width = props.width || 5;

  // Make dimensions odd
  if (height % 2 === 0) {
    height += 1;
  }
  if (sideCols % 2 === 0) {
    sideCols += 1;
}

  // Calculate the center for the mask
  const centerX = Math.floor(sideCols / 2);
  const centerY = Math.floor(height / 2);

  return (
    <div className={`banner ${decorative ? 'decorative' : ''}`}>
      <div className="square-col-container">
        {!decorative && generateCols(sideCols, height, centerX, centerY, 2, randomize)}
        {decorative && generateCols(8, 4, undefined, undefined, 2, randomize)}
      </div>
      {!decorative && (
        <div className="title">
          <h1>code the future.</h1>
        </div>
      )}
    </div>
  );
};

export default Banner;
