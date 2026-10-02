export default function Brand({ badge }) {
  return (
    <div className="header-logo">
      <span className="brand">VRIKSHAHIRE<i>.</i></span>
      {badge && <span className="admin-badge">{badge}</span>}
    </div>
  );
}