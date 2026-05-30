// Sample React component with deliberate accessibility problems — for demonstration only.
// Run: npx ui-ux-suite examples/01-cli-audit/src
// Expected: findings at the exact file:line with WCAG citations

export default function SignupForm() {
  return (
    <div className="card">
      {/* Problem: images with no alt attribute — WCAG 1.1.1 */}
      <img src="/logo.png" className="brand" />
      <img src="/hero.jpg" width="600" height="300" />

      <h1 className="hero-title">Sign up</h1>
      <p className="hero-subtitle body-copy">Create your account to get started.</p>

      <form>
        {/* Problem: inputs with no label — WCAG 3.3.2 */}
        <input type="email"    placeholder="Email address" className="body-copy" />
        <input type="password" placeholder="Password"      className="body-copy" />

        {/* Problem: button text that is not descriptive — WCAG 2.4.6 */}
        <button className="btn-primary">Submit</button>
      </form>
    </div>
  );
}
