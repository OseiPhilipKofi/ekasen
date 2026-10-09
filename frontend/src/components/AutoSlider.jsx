import { Children, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function AutoSlider({ children, label, className = "" }) {
  const slides = Children.toArray(children);
  const [paused, setPaused] = useState(false);

  if (!slides.length) return null;

  const canRotate = slides.length > 1;
  const sliderClass = [
    "auto-slider",
    className,
    paused ? "is-paused" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      className={sliderClass}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      style={{ "--slider-duration": `${Math.max(24, slides.length * 9)}s` }}
    >
      <div className="auto-slider-viewport">
        <div className="auto-slider-track">
          <div className="auto-slider-group">{slides}</div>
          {canRotate && (
            <div className="auto-slider-group" aria-hidden="true" inert>
              {slides}
            </div>
          )}
        </div>
      </div>
      {canRotate && (
        <button
          type="button"
          className="button secondary compact auto-slider-toggle"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          {paused ? "Resume slideshow" : "Pause slideshow"}
        </button>
      )}
    </div>
  );
}
