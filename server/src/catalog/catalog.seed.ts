// GENERATED FILE — run `npm run seed:catalog` after editing local-media/manifest.json.
import type { CatalogSeed } from './seedTypes.js';

export const catalogSeed: CatalogSeed = {
  "version": 1,
  "generated_from": "local-media/manifest.json",
  "generated_at": "2026-11-22",
  "artists": [
    {
      "id": "bf9a6289-1b1c-5e5b-aa38-58d3d3346657",
      "name": "Bakunawa",
      "bio": "Bakunawa write slow-burning OPM about the things that swallow us whole.",
      "art_url": "/media/cover-01.png",
      "is_verified": true,
      "genres": [
        "OPM",
        "Hugot",
        "Pinoy Rock"
      ],
      "external_id": "artist-bakunawa"
    },
    {
      "id": "132555af-67bc-5d3c-bbc9-f813829eb230",
      "name": "Diwata Drive",
      "bio": "Diwata Drive make road-trip indie for the long way home.",
      "art_url": "/media/cover-02.png",
      "is_verified": true,
      "genres": [
        "OPM",
        "Indie",
        "Chill"
      ],
      "external_id": "artist-diwata-drive"
    },
    {
      "id": "92f1eed8-77a6-599b-a6bc-9a3ae50f6dda",
      "name": "Neon Kapre",
      "bio": "Neon Kapre build synth-pop from city noise and provincial midnight.",
      "art_url": "/media/cover-03.png",
      "is_verified": false,
      "genres": [
        "OPM",
        "Synth-Pop",
        "Late Night"
      ],
      "external_id": "artist-neon-kapre"
    },
    {
      "id": "bac0b69a-4bdd-5bc8-80e4-7e12b20db17c",
      "name": "Sirena Club",
      "bio": "Sirena Club are a dream-pop four-piece from the coast.",
      "art_url": "/media/cover-05.png",
      "is_verified": false,
      "genres": [
        "OPM",
        "Dream Pop",
        "Chill"
      ],
      "external_id": "artist-sirena-club"
    }
  ],
  "albums": [
    {
      "id": "dcf0b633-6d75-5c64-94a0-633fe82eaf49",
      "title": "Panata",
      "artist_id": "bf9a6289-1b1c-5e5b-aa38-58d3d3346657",
      "type": "album",
      "release_date": "2026-03-05",
      "art_url": "/media/cover-01.png",
      "external_id": "album-bakunawa-panata"
    },
    {
      "id": "60881292-d8b6-5745-bd77-c6856755fb3b",
      "title": "Southbound",
      "artist_id": "132555af-67bc-5d3c-bbc9-f813829eb230",
      "type": "album",
      "release_date": "2026-04-06",
      "art_url": "/media/cover-02.png",
      "external_id": "album-diwata-drive-southbound"
    },
    {
      "id": "6857dbe8-845b-5d3f-b93f-5edf773c5dd1",
      "title": "Ulan",
      "artist_id": "92f1eed8-77a6-599b-a6bc-9a3ae50f6dda",
      "type": "album",
      "release_date": "2026-05-07",
      "art_url": "/media/cover-03.png",
      "external_id": "album-neon-kapre-ulan"
    },
    {
      "id": "09d22e2a-ff50-5d8f-884f-f4e127b46692",
      "title": "Hilom",
      "artist_id": "bac0b69a-4bdd-5bc8-80e4-7e12b20db17c",
      "type": "album",
      "release_date": "2026-07-09",
      "art_url": "/media/cover-05.png",
      "external_id": "album-sirena-club-hilom"
    }
  ],
  "tracks": [
    {
      "id": "a6c89dd2-0928-55a1-af62-a7577f4546e2",
      "title": "Panata",
      "artist_id": "bf9a6289-1b1c-5e5b-aa38-58d3d3346657",
      "album_id": "dcf0b633-6d75-5c64-94a0-633fe82eaf49",
      "duration_ms": 16000,
      "track_number": 1,
      "has_lyrics": true,
      "play_count": 2480,
      "genres": [
        "OPM",
        "Hugot",
        "Pinoy Rock"
      ],
      "explicit": false,
      "external_id": "test-track-01",
      "art_url": "/media/cover-01.png",
      "lyrics": {
        "lrc_text": "[ti:Panata]\n[ar:Bakunawa]\n[al:Panata]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Panata test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "8335979d-2273-5ee1-a99e-2fd39cccc387",
      "title": "Susundan",
      "artist_id": "132555af-67bc-5d3c-bbc9-f813829eb230",
      "album_id": "60881292-d8b6-5745-bd77-c6856755fb3b",
      "duration_ms": 18000,
      "track_number": 1,
      "has_lyrics": true,
      "play_count": 1930,
      "genres": [
        "OPM",
        "Indie",
        "Chill"
      ],
      "explicit": false,
      "external_id": "test-track-02",
      "art_url": "/media/cover-02.png",
      "lyrics": {
        "lrc_text": "[ti:Susundan]\n[ar:Diwata Drive]\n[al:Southbound]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Susundan test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "32a59da1-87bd-5383-8bdc-8eeb9704a26d",
      "title": "Gabing Nasa Bukid",
      "artist_id": "92f1eed8-77a6-599b-a6bc-9a3ae50f6dda",
      "album_id": "6857dbe8-845b-5d3f-b93f-5edf773c5dd1",
      "duration_ms": 14000,
      "track_number": 1,
      "has_lyrics": true,
      "play_count": 1620,
      "genres": [
        "OPM",
        "Synth-Pop",
        "Late Night"
      ],
      "explicit": false,
      "external_id": "test-track-03",
      "art_url": "/media/cover-03.png",
      "lyrics": {
        "lrc_text": "[ti:Gabing Nasa Bukid]\n[ar:Neon Kapre]\n[al:Ulan]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Gabing Nasa Bukid test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "045b0442-d001-5e3a-be7e-00f8edb36ebc",
      "title": "Tala",
      "artist_id": "bf9a6289-1b1c-5e5b-aa38-58d3d3346657",
      "album_id": "dcf0b633-6d75-5c64-94a0-633fe82eaf49",
      "duration_ms": 12000,
      "track_number": 2,
      "has_lyrics": true,
      "play_count": 2210,
      "genres": [
        "OPM",
        "Hugot"
      ],
      "explicit": false,
      "external_id": "test-track-04",
      "art_url": "/media/cover-04.png",
      "lyrics": {
        "lrc_text": "[ti:Tala]\n[ar:Bakunawa]\n[al:Panata]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Tala test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "2ab949db-e5bb-5508-8b6c-c386e7d91c02",
      "title": "Hilom",
      "artist_id": "bac0b69a-4bdd-5bc8-80e4-7e12b20db17c",
      "album_id": "09d22e2a-ff50-5d8f-884f-f4e127b46692",
      "duration_ms": 20000,
      "track_number": 1,
      "has_lyrics": true,
      "play_count": 1750,
      "genres": [
        "OPM",
        "Dream Pop",
        "Chill"
      ],
      "explicit": false,
      "external_id": "test-track-05",
      "art_url": "/media/cover-05.png",
      "lyrics": {
        "lrc_text": "[ti:Hilom]\n[ar:Sirena Club]\n[al:Hilom]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Hilom test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "e2efb62e-e560-5f11-a382-533b84af7f9f",
      "title": "Alon",
      "artist_id": "132555af-67bc-5d3c-bbc9-f813829eb230",
      "album_id": "60881292-d8b6-5745-bd77-c6856755fb3b",
      "duration_ms": 15000,
      "track_number": 2,
      "has_lyrics": true,
      "play_count": 1180,
      "genres": [
        "OPM",
        "Chill"
      ],
      "explicit": false,
      "external_id": "test-track-06",
      "art_url": "/media/cover-06.png",
      "lyrics": {
        "lrc_text": "[ti:Alon]\n[ar:Diwata Drive]\n[al:Southbound]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Alon test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "669f40bf-a3ec-555f-95ab-aa1be8afd7dc",
      "title": "Dagitab",
      "artist_id": "92f1eed8-77a6-599b-a6bc-9a3ae50f6dda",
      "album_id": "6857dbe8-845b-5d3f-b93f-5edf773c5dd1",
      "duration_ms": 10000,
      "track_number": 2,
      "has_lyrics": true,
      "play_count": 890,
      "genres": [
        "OPM",
        "Synth-Pop",
        "Late Night"
      ],
      "explicit": false,
      "external_id": "test-track-07",
      "art_url": "/media/cover-07.png",
      "lyrics": {
        "lrc_text": "[ti:Dagitab]\n[ar:Neon Kapre]\n[al:Ulan]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Dagitab test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "995f07d6-00f1-5683-83d0-d6c328a9b5aa",
      "title": "Tahan",
      "artist_id": "bac0b69a-4bdd-5bc8-80e4-7e12b20db17c",
      "album_id": "09d22e2a-ff50-5d8f-884f-f4e127b46692",
      "duration_ms": 17000,
      "track_number": 2,
      "has_lyrics": true,
      "play_count": 1310,
      "genres": [
        "OPM",
        "Dream Pop",
        "Late Night"
      ],
      "explicit": false,
      "external_id": "test-track-08",
      "art_url": "/media/cover-08.png",
      "lyrics": {
        "lrc_text": "[ti:Tahan]\n[ar:Sirena Club]\n[al:Hilom]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Tahan test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "c83a05cf-523d-5c68-8df4-d0b7cf66e8a7",
      "title": "Silid",
      "artist_id": "bf9a6289-1b1c-5e5b-aa38-58d3d3346657",
      "album_id": "dcf0b633-6d75-5c64-94a0-633fe82eaf49",
      "duration_ms": 13000,
      "track_number": 3,
      "has_lyrics": true,
      "play_count": 1420,
      "genres": [
        "OPM",
        "Indie"
      ],
      "explicit": false,
      "external_id": "test-track-09",
      "art_url": "/media/cover-09.png",
      "lyrics": {
        "lrc_text": "[ti:Silid]\n[ar:Bakunawa]\n[al:Panata]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Silid test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    },
    {
      "id": "c6e84c5c-86e7-55ce-8c4d-bf2f3e42594f",
      "title": "Wakas",
      "artist_id": "132555af-67bc-5d3c-bbc9-f813829eb230",
      "album_id": "60881292-d8b6-5745-bd77-c6856755fb3b",
      "duration_ms": 19000,
      "track_number": 3,
      "has_lyrics": true,
      "play_count": 2040,
      "genres": [
        "OPM",
        "Hugot"
      ],
      "explicit": false,
      "external_id": "test-track-10",
      "art_url": "/media/cover-10.png",
      "lyrics": {
        "lrc_text": "[ti:Wakas]\n[ar:Diwata Drive]\n[al:Southbound]\n[offset:-500]\n\n[00:00.00]Static test lyric line, replace me\n[00:03.00]This is the Wakas test verse\n[00:06.00]Synced lyrics lead by half a second\n[00:09.00]Tap a line to seek there\n[00:12.00]Highlight scrolls to the center\n[00:15.00]End of test lyrics\n",
        "offset_ms": -500,
        "synced": true
      }
    }
  ]
};
