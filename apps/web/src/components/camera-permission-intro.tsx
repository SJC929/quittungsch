"use client";

import { useState, useEffect } from "react";
import { CAMERA_PERMISSION_TEXT, type SupportedLanguage } from "@spezo/i18n";
import { LogoIcon } from "@/components/logo";

interface CameraPermissionIntroProps {
  language?: SupportedLanguage;
  onDone: () => void;
}

export function CameraPermissionIntro({ language = "de", onDone }: CameraPermissionIntroProps) {
  const t = CAMERA_PERMISSION_TEXT[language];

  async function handleAllow() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch {
      // Permission denied or not available — continue anyway
    }
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <LogoIcon size={72} />
        </div>

        {/* Camera icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3">{t.title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">{t.text}</p>

        <button
          onClick={() => void handleAllow()}
          className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-colors mb-3"
        >
          {t.button}
        </button>
        <button
          onClick={onDone}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {t.skip}
        </button>
      </div>
    </div>
  );
}

// Wrapper that shows intro only once (localStorage)
export function CameraPermissionGate({
  language = "de",
  children,
}: {
  language?: SupportedLanguage;
  children: React.ReactNode;
}) {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem("camera-intro-shown");
    if (!shown) setShowIntro(true);
  }, []);

  function handleDone() {
    localStorage.setItem("camera-intro-shown", "1");
    setShowIntro(false);
  }

  return (
    <>
      {showIntro && <CameraPermissionIntro language={language} onDone={handleDone} />}
      {children}
    </>
  );
}
