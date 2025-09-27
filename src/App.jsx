import React, { useEffect, useMemo, useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* 👇 Hier war der Fehler – ich habe die schließende </div> ergänzt
                und das überflüssige "}" entfernt */}
            <span className="text-2xl">🥩</span>
          </div>
          <h1 className="text-2xl font-bold">Biltong Shop</h1>
        </header>

        <main>
          <p>Hier kommt dein Shop-Inhalt hin …</p>
        </main>
      </div>
    </div>
  );
}
