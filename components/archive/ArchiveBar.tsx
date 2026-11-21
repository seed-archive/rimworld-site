"use client";

import { useState } from "react";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { FormattedMessage, useIntl } from "react-intl";
import { useAuth } from "@seed-archive/ui/auth";

import { MENU } from "@/lib/menu";

// The archive's one header (D15): "Seed Archive", a plain link to the domain's
// root (another zone, so not next/link), then the game's name, a link to this
// section's home, then the section's own menu, then the archive's account (D13).
export function ArchiveBar() {
  const { signOut, user } = useAuth();
  const intl = useIntl();
  const [accountMenu, setAccountMenu] = useState<HTMLElement | null>(null);
  // The open dropdown: its section and the button it hangs from.
  const [section, setSection] = useState<{
    href: string;
    el: HTMLElement;
  } | null>(null);

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ color: "inherit", textDecoration: "none", flexShrink: 0 }}
          >
            <FormattedMessage id="archive.title" />
          </Typography>
          <Typography variant="h6" color="text.secondary" aria-hidden>
            /
          </Typography>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            noWrap
            sx={{ color: "inherit", textDecoration: "none" }}
          >
            <FormattedMessage id="archive.game" />
          </Typography>
        </Box>
        {MENU.map((item) => {
          const key = item.href.slice(1);
          const open = section?.href === item.href;
          return (
            <Box key={item.href}>
              <Button
                color="inherit"
                onClick={(event) =>
                  setSection({ href: item.href, el: event.currentTarget })
                }
                id={`${key}-button`}
                aria-haspopup="true"
                aria-controls={open ? `${key}-menu` : undefined}
                aria-expanded={open ? "true" : undefined}
              >
                <FormattedMessage id={item.id} />
              </Button>
              <Menu
                id={`${key}-menu`}
                anchorEl={open ? section.el : null}
                open={open}
                onClose={() => setSection(null)}
                slotProps={{ list: { "aria-labelledby": `${key}-button` } }}
              >
                <MenuItem
                  component={Link}
                  href={item.href}
                  onClick={() => setSection(null)}
                >
                  <FormattedMessage
                    id="archive.all"
                    values={{
                      section: intl
                        .formatMessage({ id: item.id })
                        .toLowerCase(),
                    }}
                  />
                </MenuItem>
                {item.pages.map((page) => (
                  <MenuItem
                    key={page.href}
                    component={Link}
                    href={page.href}
                    onClick={() => setSection(null)}
                  >
                    <FormattedMessage id={page.id} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          );
        })}
        {user ? (
          <>
            <IconButton
              id="account-button"
              aria-label={intl.formatMessage({ id: "archive.account" })}
              aria-haspopup="true"
              aria-controls={accountMenu ? "account-menu" : undefined}
              aria-expanded={accountMenu ? "true" : undefined}
              onClick={(event) => setAccountMenu(event.currentTarget)}
              sx={{ p: 0.5 }}
            >
              {/* Google's picture; the first letter of the name without one. */}
              <Avatar
                src={user.user_metadata.avatar_url as string | undefined}
                alt={user.user_metadata.full_name as string | undefined}
                slotProps={{ img: { referrerPolicy: "no-referrer" } }}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="account-menu"
              anchorEl={accountMenu}
              open={Boolean(accountMenu)}
              onClose={() => setAccountMenu(null)}
              slotProps={{ list: { "aria-labelledby": "account-button" } }}
            >
              <MenuItem
                onClick={() => {
                  setAccountMenu(null);
                  void signOut();
                }}
              >
                <FormattedMessage id="archive.signOut" />
              </MenuItem>
            </Menu>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
