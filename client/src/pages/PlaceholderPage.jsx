export default function PlaceholderPage({ title }) {
  return (
    <div>
      <div className="topbar">
        <div>
          <h1>{title}</h1>
          <div className="topbar-sub">This section belongs to the wider CMS and isn't part of this standalone module.</div>
        </div>
      </div>
      <div className="panel">
        <div className="empty-state">
          Nothing to show here — this page is a placeholder so the sidebar navigation works end-to-end.
          <br />
          Head to <strong>Spam & Abuse</strong> in the sidebar to use this module.
        </div>
      </div>
    </div>
  );
}
