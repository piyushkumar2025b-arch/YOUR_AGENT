import { useHotkeys } from "react-hotkeys-hook";
import { useAppStore } from "../store/useAppStore";

export function useGlobalHotkeys(onOpenCommandPalette?: () => void) {
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen);
  const commandPaletteOpen = useAppStore((s) => s.commandPaletteOpen);

  // Toggle Command Palette on Ctrl+K or Cmd+K
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setCommandPaletteOpen(!commandPaletteOpen);
    if (onOpenCommandPalette) onOpenCommandPalette();
  });

  // Escape to close active modals or command palette
  useHotkeys("escape", () => {
    if (commandPaletteOpen) {
      setCommandPaletteOpen(false);
    }
  });
}
