'use client'
import {handlePageReload} from "@/lib/browser-utils";

export function Header() {

  const handleGoBack = () => {
    window.history.back()
  };

  const handleGoForward = () => {
    window.history.forward();
  };

  return <div className="header">
    <button onClick={() => handlePageReload(handleGoBack)} aria-label="Go back" />
    <div className="logo">
      <span>BCare</span>
      <div className="tagline">Vitals™</div>
    </div>
    <button onClick={() => handlePageReload(handleGoForward)} aria-label="Go forward" />
  </div>
}
