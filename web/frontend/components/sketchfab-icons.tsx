"use client";

export function SketchfabIcons() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-md h-64">
        <iframe
          title="3D Github Logo"
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/441d03d1076b44f483df551e02d970fe/embed?autostart=1&autospin=0.2&ui_theme=dark"
        />
      </div>

      <div className="w-full max-w-md h-64">
        <iframe
          title="3D Discord Logo"
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/441d03d1076b44f483df551e02d970fe/embed?autostart=1&autospin=0.2&ui_theme=dark"
        />
      </div>

      <div className="w-full max-w-md h-64">
        <iframe
          title="3D Telegram Logo"
          className="w-full h-full rounded-lg"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/441d03d1076b44f483df551e02d970fe/embed?autostart=1&autospin=0.2&ui_theme=dark"
        />
      </div>
    </div>
  );
}
