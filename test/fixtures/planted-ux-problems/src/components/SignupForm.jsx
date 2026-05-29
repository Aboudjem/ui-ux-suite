import React from 'react';

/*
 * Planted accessibility problems in JSX (scanned by walkFiles .jsx branch).
 * PLANTED[E-alt]: <img> with no alt attribute @ src/components/SignupForm.jsx — expect accessibility (missing alt text) finding
 * PLANTED[E-label]: form <input> elements with no associated <label> @ src/components/SignupForm.jsx — expect accessibility/flows (missing form labels) finding
 * PLANTED[B]: the primary CTA is rendered as a plain text link, not a button — expect hierarchy/components (CTA affordance) finding
 * PLANTED[J]: no focus-visible: utility anywhere in className — expect accessibility/interaction finding
 */
export default function SignupForm() {
  return (
    <section className="section-muted">
      {/* PLANTED[E-alt]: decorative + meaningful image with NO alt text */}
      <img src="/logo.png" className="brand" />
      <img src="/hero.jpg" width="600" height="300" />

      <form className="layout">
        {/* PLANTED[E-label]: inputs with placeholders but NO <label>, no aria-label */}
        <input type="email" placeholder="Email address" className="body-copy" />
        <input type="password" placeholder="Password" className="body-copy" />

        {/* PLANTED[B]: PRIMARY action styled as a muted ghost link, tiny, no button semantics */}
        <a href="/signup" className="cta-primary">continue</a>

        {/* PLANTED[D]: icon button with tiny 28x28 hit area */}
        <button className="icon-btn">x</button>
      </form>

      {/* PLANTED[J]: hover-only, never focus-visible */}
      <nav>
        <a href="/a" className="nav-link hover:text-gray-700">Home</a>
        <a href="/b" className="nav-link hover:text-gray-700">Pricing</a>
      </nav>
    </section>
  );
}
