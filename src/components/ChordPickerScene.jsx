/** Full-frame sunset background (border in image; stars overlaid in UI) */

export function ChordPickerScene() {
  return (
    <div className="sw-scene" aria-hidden>
      <img
        className="sw-scene__bg"
        src="/images/background-sunset.png?v=5"
        alt=""
        draggable={false}
      />
    </div>
  )
}
