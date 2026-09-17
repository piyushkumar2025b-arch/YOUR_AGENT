import React, { useState, useEffect, useRef, useCallback, memo } from "react";

interface VirtualLineGutterProps {
  totalLines: number;
  lineHeight: number;
  editorFontSize: number;
  cursorLine: number;
  activeBreakpoints: number[];
  onToggleBreakpoint: (lineNum: number) => void;
  onJumpToLine: (lineNum: number) => void;
  editorTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  gutterRef: React.RefObject<HTMLDivElement | null>;
}

export const VirtualLineGutter: React.FC<VirtualLineGutterProps> = memo(({
  totalLines,
  lineHeight,
  editorFontSize,
  cursorLine,
  activeBreakpoints,
  onToggleBreakpoint,
  onJumpToLine,
  editorTextareaRef,
  gutterRef
}) => {
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(600);
  const lastScrollTopRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Measure viewport height on mount and resize
  useEffect(() => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    const updateHeight = () => {
      setViewportHeight(textarea.clientHeight || 600);
    };
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(textarea);

    return () => {
      resizeObserver.disconnect();
    };
  }, [editorTextareaRef]);

  // Synchronize gutter scrolling with textarea using requestAnimationFrame
  useEffect(() => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    const onScroll = () => {
      const currentScrollTop = textarea.scrollTop;

      // Keep gutter element scrolled in sync directly without waiting for React render
      if (gutterRef.current) {
        gutterRef.current.scrollTop = currentScrollTop;
      }

      // Throttle React state updates: only re-calculate visible window if scrolled by > 5 lines
      if (Math.abs(currentScrollTop - lastScrollTopRef.current) > lineHeight * 5) {
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
          lastScrollTopRef.current = currentScrollTop;
          setScrollTop(currentScrollTop);
          rafIdRef.current = null;
        });
      }
    };

    textarea.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      textarea.removeEventListener("scroll", onScroll);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [editorTextareaRef, gutterRef, lineHeight]);

  // Virtual windowing math: Only render lines visible in viewport + 10 line overscan
  const effectiveLineHeight = Math.max(14, lineHeight || 22);
  const overscan = 12;
  const startIndex = Math.max(0, Math.floor(scrollTop / effectiveLineHeight) - overscan);
  const visibleCount = Math.ceil(viewportHeight / effectiveLineHeight) + overscan * 2;
  const endIndex = Math.min(totalLines, startIndex + visibleCount);

  const visibleLines: number[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleLines.push(i + 1);
  }

  const totalGutterHeight = Math.max(viewportHeight, totalLines * effectiveLineHeight + 32);

  const handleLineClick = useCallback((lineNum: number) => {
    onJumpToLine(lineNum);
  }, [onJumpToLine]);

  return (
    <div
      ref={gutterRef}
      className="w-14 bg-[#18181b] border-r border-white/10 select-none overflow-hidden shrink-0 font-mono text-right relative pointer-events-auto"
      style={{ fontSize: `${editorFontSize}px` }}
    >
      {/* Spacer matching total document height */}
      <div
        className="w-full relative"
        style={{ height: `${totalGutterHeight}px` }}
      >
        {/* Virtualized window container positioned at offset */}
        <div
          className="absolute left-0 right-0 pt-4 pb-4 px-1 flex flex-col will-change-transform"
          style={{
            transform: `translateY(${startIndex * effectiveLineHeight}px)`
          }}
        >
          {visibleLines.map((lineNum) => {
            const isActive = lineNum === cursorLine;
            const hasBp = activeBreakpoints.includes(lineNum);

            return (
              <div
                key={lineNum}
                onClick={() => handleLineClick(lineNum)}
                title={`Line ${lineNum} ${hasBp ? "(Breakpoint)" : ""}`}
                style={{ height: `${effectiveLineHeight}px`, lineHeight: `${effectiveLineHeight}px` }}
                className={`flex items-center justify-end gap-1 px-1 rounded cursor-pointer transition-colors group ${
                  isActive
                    ? "text-sky-300 font-bold bg-sky-500/20 border-l-2 border-sky-400 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBreakpoint(lineNum);
                  }}
                  className={`w-2 h-2 rounded-full transition-all shrink-0 cursor-pointer ${
                    hasBp
                      ? "bg-rose-500 shadow-xs shadow-rose-500/80 scale-125"
                      : "bg-transparent group-hover:bg-rose-500/30 hover:scale-110"
                  }`}
                  title={hasBp ? "Remove Breakpoint" : "Add Breakpoint"}
                />
                <span className="font-mono text-xs">{lineNum}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

VirtualLineGutter.displayName = "VirtualLineGutter";
