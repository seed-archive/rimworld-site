"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";
import type { Card } from "@seed-archive/map/card";
import { MapClient, type World } from "@seed-archive/map/client";
import type { Marker, Overlay } from "@seed-archive/map/viewer";

import { ArchiveBar } from "@/components/archive/ArchiveBar";
import { MapFields } from "@/components/rimworld/SettingsFields";
import { rgba, TERRAIN_PALETTE } from "@/lib/rimworld/palette";
import {
  generatorKey,
  readSettings,
  type Settings,
  settingsQuery,
  WASM_PATH,
} from "@/lib/rimworld/settings";

// Leaflet touches `window`, so the viewer loads in the browser only.
const Viewer = dynamic(() => import("@seed-archive/map/viewer"), {
  ssr: false,
});

// A map is 200 to 400 cells across: at zoom 3 a cell is eight pixels, at −2 a
// quarter of one (our own choice).
const MIN_ZOOM = -2;
const MAX_ZOOM = 3;
// A world of cells: at zoom 0 a pixel is one cell, and nothing finer is
// computed (the shared rule of the archive's maps).
const MAX_NATIVE_ZOOM = 0;
const BACKGROUND = "#1b1f24";
// Kept as constants: the viewer rebuilds its tiles on a new array or object.
const NO_OVERLAYS: Overlay[] = [];
const ALL_VISIBLE: Record<string, boolean> = {};
// The kinds of places the generator numbers.
const PLACE_KINDS = ["geyser"];

function moduleUrl(): string {
  return new URL(WASM_PATH, window.location.href).href;
}

export function MapScreen() {
  const intl = useIntl();
  const t = useCallback(
    (id: string, values?: Record<string, string | number>) =>
      intl.formatMessage({ id }, values),
    [intl],
  );
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [initial] = useState(() => readSettings(params));
  const [dev, setDev] = useState(false);
  const { control } = useForm<Settings>({ defaultValues: initial });
  const values = useWatch({ control }) as Settings;
  const settings: Settings = { ...initial, ...values };
  const key = generatorKey(settings);
  const query = settingsQuery(settings);

  const [client, setClient] = useState<MapClient | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [biome, setBiome] = useState<number | null>(null);
  const palette = useMemo(() => rgba(TERRAIN_PALETTE), []);

  useEffect(() => {
    router.replace(`${pathname}?${query}`, { scroll: false });
  }, [router, pathname, query]);

  useEffect(() => {
    const c = new MapClient(moduleUrl());
    let live = true;
    c.worlds("").then(() => live && setClient(c));
    return () => {
      live = false;
      c.close();
    };
  }, []);

  const tile = settings.tile;
  const coverage = settings.coverage;
  useEffect(() => {
    if (!client || tile === null) {
      return;
    }
    let live = true;
    client.worlds(key).then((w) => live && setWorlds(w));
    client
      .call<Float64Array>("globeCell", [key, coverage, tile])
      .then((cell) => live && setBiome(cell[0] ?? null));
    client.places(key, 0).then((raw) => {
      if (!live) {
        return;
      }
      const out: Marker[] = [];
      for (let i = 0; i + 3 <= raw.length; i += 3) {
        const [kind, x, y] = raw.slice(i, i + 3);
        out.push({
          layer: "places",
          x,
          y,
          card: {
            title: t(`pages.map.places.${PLACE_KINDS[kind]}`),
            meta: `x ${Math.floor(x)}, z ${Math.floor(y)}`,
            lines: [],
          },
          dot: { radius: 5, fill: "#ffffff" },
        });
      }
      setMarkers(out);
    });
    return () => {
      live = false;
    };
  }, [client, key, coverage, tile, t]);

  const world = useMemo(
    () => (worlds[0] ? { index: 0, bounds: worlds[0] } : null),
    [worlds],
  );

  const describe = useCallback(
    async (x: number, y: number): Promise<Card | null> => {
      if (!client) {
        return null;
      }
      const [terrain] = await client.point(key, 0, x, y);
      return terrain
        ? {
            title: t(`pages.map.terrain.${terrain}`),
            meta: `x ${Math.floor(x)}, z ${Math.floor(y)}`,
            lines: [],
          }
        : null;
    },
    [client, key, t],
  );

  const labels = useMemo(
    () => ({
      pin: t("pages.map.pin"),
      removePin: t("pages.map.removePin"),
      length: (units: number) => t("pages.map.length", { n: units }),
    }),
    [t],
  );

  return (
    <Box sx={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <ArchiveBar />
      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <Typography variant="h1" sx={{ position: "absolute", left: -10000 }}>
          <FormattedMessage id="pages.map.title" />
        </Typography>
        {tile === null ? null : (
          <Viewer
            client={client}
            seed={key}
            world={world}
            palette={palette}
            background={BACKGROUND}
            overlays={NO_OVERLAYS}
            visible={ALL_VISIBLE}
            markers={markers}
            describe={describe}
            ruler
            focus={null}
            pinsKey="rimworld-pins"
            labels={labels}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            maxNativeZoom={MAX_NATIVE_ZOOM}
            scale={false}
          />
        )}
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            p: 2,
            zIndex: 1000,
            width: 280,
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h6" component="p">
                <FormattedMessage id="pages.map.title" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tile === null ? (
                  <FormattedMessage id="pages.map.noTile" />
                ) : (
                  <FormattedMessage
                    id="pages.map.where"
                    values={{
                      seed: settings.seed,
                      tile,
                      biome:
                        biome === null
                          ? "…"
                          : t(`pages.globe.classes.${biome}`),
                    }}
                  />
                )}
              </Typography>
            </Box>
            <MapFields control={control} dev={dev} size={settings.size} />
            <FormControlLabel
              control={
                <Switch
                  id="settings-dev"
                  checked={dev}
                  onChange={(event) => setDev(event.target.checked)}
                />
              }
              label={t("settings.dev")}
            />
            <Button
              component={Link}
              href={`/tools/globe?${query}`}
              variant="outlined"
            >
              <FormattedMessage id="pages.map.toGlobe" />
            </Button>
            <Typography variant="caption" color="text.secondary">
              <FormattedMessage id="pages.map.lead" />
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
