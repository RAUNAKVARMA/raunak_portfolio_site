import { GALAXY_COLOR_PRESETS } from '../../../lib/galaxyParams'

/**
 * Compact Astrarise-style galaxy color panel.
 */
function GalaxyColorControls({
  presetId,
  custom,
  onSelectPreset,
  onCustomChange,
}) {
  return (
    <div className="cosmos-color-panel" role="group" aria-label="Galaxy color">
      <p className="cosmos-color-label">Galaxy color</p>
      <div className="cosmos-color-swatches">
        {GALAXY_COLOR_PRESETS.map((preset) => {
          const active = presetId === preset.id && !custom
          return (
            <button
              key={preset.id}
              type="button"
              className={`cosmos-color-swatch${active ? ' is-active' : ''}`}
              style={{
                background: `linear-gradient(135deg, ${preset.insideColor}, ${preset.midColor}, ${preset.outsideColor})`,
              }}
              aria-label={preset.label}
              aria-pressed={active}
              title={preset.label}
              data-cursor-hover="true"
              onClick={() => onSelectPreset(preset.id)}
            />
          )
        })}
      </div>

      <div className="cosmos-color-custom">
        <label className="cosmos-color-field">
          <span>Core</span>
          <input
            type="color"
            value={custom?.insideColor || GALAXY_COLOR_PRESETS[0].insideColor}
            onChange={(e) =>
              onCustomChange({
                insideColor: e.target.value,
                midColor: custom?.midColor || GALAXY_COLOR_PRESETS[0].midColor,
                outsideColor: custom?.outsideColor || GALAXY_COLOR_PRESETS[0].outsideColor,
              })
            }
          />
        </label>
        <label className="cosmos-color-field">
          <span>Mid</span>
          <input
            type="color"
            value={custom?.midColor || GALAXY_COLOR_PRESETS[0].midColor}
            onChange={(e) =>
              onCustomChange({
                insideColor: custom?.insideColor || GALAXY_COLOR_PRESETS[0].insideColor,
                midColor: e.target.value,
                outsideColor: custom?.outsideColor || GALAXY_COLOR_PRESETS[0].outsideColor,
              })
            }
          />
        </label>
        <label className="cosmos-color-field">
          <span>Rim</span>
          <input
            type="color"
            value={custom?.outsideColor || GALAXY_COLOR_PRESETS[0].outsideColor}
            onChange={(e) =>
              onCustomChange({
                insideColor: custom?.insideColor || GALAXY_COLOR_PRESETS[0].insideColor,
                midColor: custom?.midColor || GALAXY_COLOR_PRESETS[0].midColor,
                outsideColor: e.target.value,
              })
            }
          />
        </label>
      </div>
    </div>
  )
}

export default GalaxyColorControls
