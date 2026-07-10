/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { Modules } from "./components/Modules";
import { ReportGenerator } from "./components/ReportGenerator";
import { AdminPanel } from "./components/AdminPanel";
import { SearchHistoryItem } from "./types";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [systemStatus, setSystemStatus] = useState("Healthy");
  
  // Real Local Search History
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  
  // Real Local Bookmarks
  const [bookmarks, setBookmarks] = useState<SearchHistoryItem[]>([]);

  // Fetch search history and bookmarks from server upon load
  const loadWorkspaceData = async () => {
    try {
      const [historyRes, bookmarksRes] = await Promise.all([
        fetch("/api/search-history"),
        fetch("/api/bookmarks")
      ]);
      const historyData = await historyRes.json();
      const bookmarksData = await bookmarksRes.json();
      
      setHistory(historyData.history || []);
      setBookmarks(bookmarksData.bookmarks || []);
    } catch (e) {
      console.error("Failed to load workspace data from Express server backend", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaceData();
    }
  }, [isAuthenticated]);

  // Handle addition of target search items to history
  const handleAddHistory = async (query: string, type: string) => {
    // History is captured automatically on the backend during API lookup cycles
    // Force immediate reload to capture state alignment
    await loadWorkspaceData();
  };

  // Handle bookmark additions
  const handleAddBookmark = async (query: string, type: string) => {
    try {
      const res = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type })
      });
      if (res.ok) {
        await loadWorkspaceData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle removal of bookmarks
  const handleRemoveBookmark = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmark/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await loadWorkspaceData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch renderer inside Dashboard Layout
  const renderDashboardViews = () => {
    if (activeModule === "reports") {
      return <ReportGenerator onAddHistory={handleAddHistory} />;
    }
    if (activeModule === "admin") {
      return <AdminPanel />;
    }
    return (
      <Modules 
        activeModule={activeModule} 
        setActiveModule={setActiveModule}
        onAddHistory={handleAddHistory}
        onAddBookmark={handleAddBookmark}
        bookmarks={bookmarks}
      />
    );
  };

  return (
    <>
      {!isAuthenticated ? (
        <LandingPage onStart={() => setIsAuthenticated(true)} />
      ) : (
        <DashboardLayout
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          history={history}
          bookmarks={bookmarks}
          onRemoveBookmark={handleRemoveBookmark}
          systemStatus={systemStatus}
          onLogout={() => setIsAuthenticated(false)}
        >
          {renderDashboardViews()}
        </DashboardLayout>
      )}
    </>
  );
}
