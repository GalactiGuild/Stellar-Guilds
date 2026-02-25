import { useRef } from "react";

const SwipeableCard = ({ children }) => {
  const startX = useRef(0);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - startX.current;

    if (diff > 100) {
      console.log("Swiped Right");
    }

    if (diff < -100) {
      console.log("Swiped Left");
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="card"
    >
      {children}
    </div>
  );
};

export default SwipeableCard;