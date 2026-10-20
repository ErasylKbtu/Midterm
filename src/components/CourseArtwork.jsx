import { getCourseTheme } from "../lib/courseUi.js";
export default function CourseArtwork({ category, large = false }) {
  const { tone, symbol, short, label } = getCourseTheme(category);
  return (
    <div
      className={`course-art art-${tone} ${large ? "art-large" : ""}`}
      aria-hidden="true"
    >
      <span className="art-label">{label}</span>
      <div className="art-shape shape-one" />
      <div className="art-shape shape-two" />
      <span className="art-symbol">{symbol}</span>
      <span className="art-copy">{short}</span>
      <span className="art-number">STUDYHUB / OPEN YOUR MIND</span>
    </div>
  );
}
