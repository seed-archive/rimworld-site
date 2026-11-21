"use client";

import { type Control, Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";

import {
  COVERAGES,
  DEV_COVERAGES,
  DEV_MAP_SIZES,
  LARGE_MAP,
  MAP_SIZES,
  POLLUTION_STEP,
  SEASONS,
  type Settings,
  SLIDER_NORMAL,
  SLIDER_STEPS,
} from "@/lib/rimworld/settings";

type SliderName = "rainfall" | "temperature" | "population" | "landmarks";
const SLIDERS: SliderName[] = [
  "rainfall",
  "temperature",
  "population",
  "landmarks",
];

// A seven-step slider as the game's world page draws it: low, normal, high.
function StepSlider({
  name,
  control,
}: {
  name: SliderName;
  control: Control<Settings>;
}) {
  const intl = useIntl();
  const marks = [
    { value: 0, label: intl.formatMessage({ id: `settings.${name}.low` }) },
    {
      value: SLIDER_NORMAL,
      label: intl.formatMessage({ id: "settings.normal" }),
    },
    {
      value: SLIDER_STEPS - 1,
      label: intl.formatMessage({ id: `settings.${name}.high` }),
    },
  ];
  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="body2" id={`settings-${name}`}>
        <FormattedMessage id={`settings.${name}.label`} />
      </Typography>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Slider
            aria-labelledby={`settings-${name}`}
            value={field.value}
            onChange={(_, value) => field.onChange(value as number)}
            min={0}
            max={SLIDER_STEPS - 1}
            step={1}
            marks={marks}
            size="small"
          />
        )}
      />
    </Box>
  );
}

// The world page's settings.
export function WorldFields({
  control,
  dev,
}: {
  control: Control<Settings>;
  dev: boolean;
}) {
  const intl = useIntl();
  const coverages = dev ? [...DEV_COVERAGES, ...COVERAGES] : COVERAGES;
  return (
    <>
      <Controller
        name="seed"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            id="settings-seed"
            size="small"
            label={intl.formatMessage({ id: "settings.seed" })}
            fullWidth
          />
        )}
      />
      <Controller
        name="coverage"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            id="settings-coverage"
            select
            size="small"
            label={intl.formatMessage({ id: "settings.coverage" })}
            onChange={(event) => field.onChange(Number(event.target.value))}
          >
            {coverages.map((c) => (
              <MenuItem key={c} value={c}>
                {c}%
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      {SLIDERS.map((name) => (
        <StepSlider key={name} name={name} control={control} />
      ))}
      <Box sx={{ px: 1 }}>
        <Typography variant="body2" id="settings-pollution">
          <FormattedMessage id="settings.pollution" />
        </Typography>
        <Controller
          name="pollution"
          control={control}
          render={({ field }) => (
            <Slider
              aria-labelledby="settings-pollution"
              value={field.value}
              onChange={(_, value) => field.onChange(value as number)}
              min={0}
              max={100}
              step={POLLUTION_STEP}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              size="small"
            />
          )}
        />
      </Box>
    </>
  );
}

// The new game's advanced settings: map size and starting season.
export function MapFields({
  control,
  dev,
  size,
}: {
  control: Control<Settings>;
  dev: boolean;
  size: number;
}) {
  const intl = useIntl();
  const sizes = dev ? [...MAP_SIZES, ...DEV_MAP_SIZES] : MAP_SIZES;
  return (
    <>
      <Controller
        name="size"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            id="settings-size"
            select
            size="small"
            label={intl.formatMessage({ id: "settings.size" })}
            onChange={(event) => field.onChange(Number(event.target.value))}
            helperText={
              size > LARGE_MAP
                ? intl.formatMessage({ id: "settings.sizeWarning" })
                : undefined
            }
          >
            {sizes.map((s) => (
              <MenuItem key={s} value={s}>
                <FormattedMessage
                  id="settings.sizeOption"
                  values={{ side: s, cells: intl.formatNumber(s * s) }}
                />
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <Controller
        name="season"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            id="settings-season"
            select
            size="small"
            label={intl.formatMessage({ id: "settings.season" })}
          >
            {SEASONS.map((s) => (
              <MenuItem key={s} value={s}>
                <FormattedMessage id={`settings.seasons.${s}`} />
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    </>
  );
}
