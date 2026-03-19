import { useRef, useState } from "react";
import { copy } from "../config/copy";
import type { Profile, SwipeChoice } from "../types";
import { ProfileCard } from "./ProfileCard";

const SWIPE_THRESHOLD = 120;

type SwipeDeckProps = {
  profile: Profile;
  currentIndex: number;
  total: number;
  onChoice: (choice: SwipeChoice) => void;
};

export function SwipeDeck({ profile, currentIndex, total, onChoice }: SwipeDeckProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const activePointerId = useRef<number | null>(null);

  const clearDrag = () => {
    setDragX(0);
    setIsDragging(false);
    pointerStartX.current = null;
    activePointerId.current = null;
  };

  const resolveChoice = (choice: SwipeChoice) => {
    clearDrag();
    onChoice(choice);
  };

  return (
    <section className="browse-stage">
      <div className="browse-stage__meta">
        <div>
          <p className="eyebrow">{copy.progressLabel}</p>
          <h1>
            {currentIndex + 1} из {total}
          </h1>
        </div>
        <p>{copy.swipeHint}</p>
      </div>

      <div className="swipe-shell">
        <div className="swipe-shell__backdrop swipe-shell__backdrop--rear" />
        <div className="swipe-shell__backdrop swipe-shell__backdrop--front" />
        <ProfileCard
          profile={profile}
          className={isDragging ? "is-dragging" : ""}
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX / 25}deg)`,
            opacity: 1 - Math.min(Math.abs(dragX) / 260, 0.35),
          }}
        />
        <div
          className="swipe-layer"
          onPointerDown={(event) => {
            activePointerId.current = event.pointerId;
            pointerStartX.current = event.clientX;
            setIsDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!isDragging || activePointerId.current !== event.pointerId) {
              return;
            }

            const startX = pointerStartX.current;

            if (startX === null) {
              return;
            }

            setDragX(event.clientX - startX);
          }}
          onPointerUp={(event) => {
            if (activePointerId.current !== event.pointerId) {
              return;
            }

            if (dragX >= SWIPE_THRESHOLD) {
              resolveChoice("like");
              return;
            }

            if (dragX <= -SWIPE_THRESHOLD) {
              resolveChoice("pass");
              return;
            }

            clearDrag();
          }}
          onPointerCancel={clearDrag}
        />

        <div
          className={["swipe-badge", "swipe-badge--left", dragX <= -40 ? "is-visible" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {copy.pass}
        </div>
        <div
          className={["swipe-badge", "swipe-badge--right", dragX >= 40 ? "is-visible" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {copy.like}
        </div>
      </div>

      <div className="action-row">
        <button className="action-button action-button--ghost" onClick={() => resolveChoice("pass")}>
          {copy.pass}
        </button>
        <button className="action-button action-button--primary" onClick={() => resolveChoice("like")}>
          {copy.like}
        </button>
      </div>
    </section>
  );
}
