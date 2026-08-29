// App.jsx
// Standalone demo entry — lets you run/test this module on its own
// with `npm start` before merging into the team's main App.js.
// When merging: just import AdminDashboard into the shared router instead
// (e.g. <Route path="/admin" element={<AdminDashboard />} />).

import React from "react";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  return <AdminDashboard />;
}
