import {
  ArrowUpRight,
  ArrowRight,
  Braces,
  Check,
  Sparkles,
} from "lucide-react";
export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="tiny-star">✳</span> A LITTLE CURIOSITY GOES A LONG
          WAY
        </div>
        <h1 id="hero-title">
          A new skill.
          <br />
          <span>A new possibility.</span>
        </h1>
        <p>
          Big ideas start with small steps. Find your next course
          <br className="desktop-break" /> and make today a little more
          interesting.
        </p>
        <a className="button button-dark" href="#catalog">
          Explore courses <ArrowUpRight size={18} />
        </a>
        <span className="hero-footnote">At your pace. On your terms.</span>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-grid" />
        <div className="orbit-ring" />
        <div className="floating-star">✳</div>
        <div className="skill-tile tile-code">
          <Braces size={39} />
          <span>make something.</span>
          <i />
        </div>
        <div className="skill-tile tile-design">
          <div className="tile-circles">
            <i />
            <i />
            <i />
          </div>
          <span>
            Think outside
            <br />
            the ordinary.
          </span>
          <ArrowUpRight size={34} />
        </div>
        <div className="skill-tile tile-progress">
          <span className="progress-check">
            <Check size={21} />
          </span>
          <div>
            <strong>One step closer</strong>
            <small>Progress is a practice.</small>
          </div>
          <Sparkles size={18} />
        </div>
        <span className="hero-art-caption">
          YOUR NEXT CHAPTER <ArrowRight size={13} />
        </span>
      </div>
    </section>
  );
}
