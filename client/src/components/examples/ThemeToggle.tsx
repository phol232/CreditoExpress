import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-8 bg-background">
      <div className="flex items-center gap-4">
        <span className="text-foreground">Cambiar tema:</span>
        <ThemeToggle />
      </div>
    </div>
  );
}