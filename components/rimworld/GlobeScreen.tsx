"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import { GlobeClient } from "@seed-archive/globe/client";
import Globe, { type Cells, type GlobePoint } from "@seed-archive/globe/globe";

import { ArchiveBar } from "@/components/archive/ArchiveBar";
import { MapFields, WorldFields } from "@/components/rimworld/SettingsFields";
import { PALETTE, rgba } from "@/lib/rimworld/palette";
import {
  generatorKey,
  readSettings,
  type Settings,
  settingsQuery,
  WASM_PATH,
} from "@/lib/rimworld/settings";

// The scene's background. Our own choice.
const SPACE = "#0e141b";
const GROUND_PALETTE = rgba(PALETTE);
// The picked tile, drawn over the ground: index 1 a strong red (our own
// choice).
const PICK_PALETTE = rgba([
  [0, 0, 0],
  [230, 40, 40],
]);
const SHOW_PICK = { pick: true };

// What the panel shows of a tile. Latitude and longitude are known only for a
// tile pointed at on the globe.
type Tile = {
  id: number;
  lat?: number;
  lon?: number;
  biome: number;
  hills: number;
  mapSeed: number;
};

// A tile read in the generator's worker: [biome, corners, hilliness, map
// seed], empty past the last tile.
async function readTile(
  client: GlobeClient,
  key: string,
  coverage: number,
  id: number,
  at?: { lat: number; lon: number },
): Promise<Tile | null> {
  const [biome, , hills, mapSeed] = await client.cell(key, coverage, id);
  return biome === undefined ? null : { id, ...at, biome, hills, mapSeed };
}

function TileLines({ tile }: { tile: Tile }) {
  return (
    <>
      <Typography>
        <FormattedMessage id={`pages.globe.classes.${tile.biome}`} />
        {tile.hills ? (
          <>
            {" · "}
            <FormattedMessage id={`pages.globe.hills.${tile.hills}`} />
          </>
        ) : null}
      </Typography>
      {tile.lat !== undefined && tile.lon !== undefined ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage
            id="pages.globe.latLon"
            values={{
              lat: (
                <FormattedNumber value={tile.lat} maximumFractionDigits={2} />
              ),
              lon: (
                <FormattedNumber value={tile.lon} maximumFractionDigits={2} />
              ),
            }}
          />
        </Typography>
      ) : null}
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage
          id="pages.globe.mapSeed"
          values={{ seed: tile.mapSeed }}
        />
      </Typography>
    </>
  );
}

export function GlobeScreen() {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [initial] = useState(() => readSettings(params));
  const [client, setClient] = useState<GlobeClient | null>(null);
  const [seed, setSeed] = useState(initial.seed);
  const [ground, setGround] = useState<Uint8Array | null>(null);
  const [hover, setHover] = useState<Tile | null>(null);
  const [picked, setPicked] = useState<Tile | null>(null);
  // Where the picked tile was clicked, for its latitude and longitude.
  const [clickedAt, setClickedAt] = useState<{
    id: number;
    lat: number;
    lon: number;
  } | null>(null);
  const [dev, setDev] = useState(false);
  const [borders, setBorders] = useState(true);
  // Only the latest hover's answer is shown.
  const hoverTurn = useRef(0);

  const { control, handleSubmit, setValue } = useForm<Settings>({
    defaultValues: initial,
  });
  const values = useWatch({ control }) as Settings;
  const settings: Settings = { ...values, seed };
  const key = generatorKey(settings);
  const query = settingsQuery(settings);
  const coverage = settings.coverage;
  const tile = settings.tile;

  // The generator runs in the package's workers, never on this thread.
  useEffect(() => {
    const c = new GlobeClient(new URL(WASM_PATH, window.location.href).href);
    let live = true;
    // The workers start with the first call; the page uses the client after.
    void Promise.resolve().then(() => live && setClient(c));
    return () => {
      live = false;
      c.close();
    };
  }, []);

  // The address follows the settings, so a link opens the same planet.
  useEffect(() => {
    router.replace(`${pathname}?${query}`, { scroll: false });
  }, [router, pathname, query]);

  // The ground's colours depend only on what shapes the planet; a new seed
  // recolours the mesh, a new coverage rebuilds it.
  const planetKey = [
    seed,
    coverage,
    settings.temperature,
    settings.rainfall,
  ].join("\n");
  useEffect(() => {
    if (!client) {
      return;
    }
    let live = true;
    client.colors(planetKey, coverage, 0).then((c) => live && setGround(c));
    return () => {
      live = false;
    };
  }, [client, planetKey, coverage]);

  // The picked tile, read again whenever the planet changes under it.
  useEffect(() => {
    if (!client || tile === null) {
      return;
    }
    let live = true;
    const at = clickedAt?.id === tile ? clickedAt : undefined;
    readTile(client, key, coverage, tile, at).then((t) => live && setPicked(t));
    return () => {
      live = false;
    };
  }, [client, key, coverage, tile, clickedAt]);

  const surface = useMemo((): Cells | null => {
    if (!client || !ground) {
      return null;
    }
    const pick = new Uint8Array(ground.length);
    if (tile !== null && tile < pick.length) {
      pick[tile] = 1;
    }
    return {
      kind: "cells",
      client,
      grid: coverage,
      ground: { colors: ground, palette: GROUND_PALETTE },
      layers: [{ id: "pick", colors: pick, palette: PICK_PALETTE }],
      borders,
    };
  }, [client, coverage, ground, tile, borders]);

  const onHover = (point: GlobePoint | null) => {
    const turn = ++hoverTurn.current;
    if (!client || !point || point.cell === undefined) {
      setHover(null);
      return;
    }
    void readTile(client, key, coverage, point.cell, point).then(
      (t) => turn === hoverTurn.current && setHover(t),
    );
  };
  const onClick = (point: GlobePoint) => {
    if (point.cell !== undefined) {
      setClickedAt({ id: point.cell, lat: point.lat, lon: point.lon });
      setValue("tile", point.cell);
    }
  };
  const shown = tile !== null && picked?.id === tile ? picked : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
      <ArchiveBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          flex: 1,
          minHeight: 0,
        }}
      >
        <Stack
          component="form"
          onSubmit={handleSubmit((v) => setSeed(v.seed.trim()))}
          spacing={2}
          sx={{
            p: 2,
            width: { md: 340 },
            flexShrink: 0,
            borderRight: { md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: "divider",
            overflowY: "auto",
          }}
        >
          <Box>
            <Typography variant="h5" component="h1">
              <FormattedMessage id="pages.globe.title" />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="pages.globe.lead" />
            </Typography>
          </Box>
          <WorldFields control={control} dev={dev} />
          <Button type="submit" variant="contained">
            <FormattedMessage id="pages.globe.show" />
          </Button>
          <Divider />
          <Box>
            <Typography variant="subtitle1">
              {shown ? (
                <FormattedMessage
                  id="pages.globe.picked"
                  values={{ id: shown.id }}
                />
              ) : (
                <FormattedMessage id="pages.globe.pick" />
              )}
            </Typography>
            {shown ? <TileLines tile={shown} /> : null}
          </Box>
          <MapFields control={control} dev={dev} size={settings.size} />
          <Button
            component={Link}
            href={`/tools/map?${query}`}
            variant="contained"
            disabled={!shown || shown.biome <= 2}
          >
            <FormattedMessage id="pages.globe.openMap" />
          </Button>
          {shown && shown.biome <= 2 ? (
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage id="pages.globe.water" />
            </Typography>
          ) : null}
          <Divider />
          <Box sx={{ minHeight: 72 }}>
            {hover ? (
              <>
                <Typography variant="subtitle2">
                  <FormattedMessage
                    id="pages.globe.cell"
                    values={{ id: hover.id }}
                  />
                </Typography>
                <TileLines tile={hover} />
              </>
            ) : (
              <Typography color="text.secondary">
                <FormattedMessage
                  id={ground ? "pages.globe.hover" : "pages.globe.loading"}
                />
              </Typography>
            )}
          </Box>
          <FormControlLabel
            control={
              <Switch
                id="globe-borders"
                checked={borders}
                onChange={(event) => setBorders(event.target.checked)}
              />
            }
            label={intl.formatMessage({ id: "pages.globe.borders" })}
          />
          <FormControlLabel
            control={
              <Switch
                id="settings-dev"
                checked={dev}
                onChange={(event) => setDev(event.target.checked)}
              />
            }
            label={intl.formatMessage({ id: "settings.dev" })}
          />
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage id="pages.globe.link" />
          </Typography>
        </Stack>
        <Box sx={{ flex: 1, minHeight: { xs: 360, md: 0 } }}>
          <Globe
            surface={surface}
            background={SPACE}
            visible={SHOW_PICK}
            onHover={onHover}
            onClick={onClick}
          />
        </Box>
      </Box>
    </Box>
  );
}
