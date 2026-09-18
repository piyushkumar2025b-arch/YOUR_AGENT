export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audioUrl: string;
  imageUrl: string;
  duration: number;
  source: string;
}

export const LOFI_STUDY_TRACKS: Track[] = [
  {
    id: "lofi-1",
    title: "Lofi Study Beats & Focus Wave",
    artist: "SoundHelix & Ambient Lab",
    album: "Study Sessions 2026",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400",
    duration: 372,
    source: "Lofi Study Station"
  },
  {
    id: "lofi-2",
    title: "Midnight Coffee & Coding",
    artist: "Acoustic Lofi Duo",
    album: "Late Night Coding",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400",
    duration: 423,
    source: "Lofi Study Station"
  },
  {
    id: "lofi-3",
    title: "Rainy Day Rhythm & Focus",
    artist: "Rain & Piano Beats",
    album: "Focus & Chill",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    imageUrl: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=400",
    duration: 345,
    source: "Lofi Study Station"
  },
  {
    id: "lofi-4",
    title: "Deep Focus Synth Lofi",
    artist: "Byte Code",
    album: "Deep Work Waves",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    imageUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400",
    duration: 502,
    source: "Lofi Study Station"
  },
  {
    id: "lofi-5",
    title: "Zen Garden Instrumental",
    artist: "Oriental Sitar & Flute",
    album: "Peaceful Meditation",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    duration: 360,
    source: "Lofi Study Station"
  },
  {
    id: "lofi-6",
    title: "Tokyo Night Chillhop",
    artist: "Synthwave Duo",
    album: "Neon Boulevard",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400",
    duration: 420,
    source: "Lofi Study Station"
  }
];

export const WORLD_RADIO_STATIONS: Track[] = [
  {
    id: "radio-bolly-1",
    title: "Radio Mirchi Bollywood Live",
    artist: "Mirchi Bollywood 98.3",
    album: "Live World Radio Stream",
    audioUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
    duration: 99999,
    source: "Mirchi Bollywood Stream"
  },
  {
    id: "radio-holly-2",
    title: "Hollywood Hits & Pop Radio",
    artist: "Global FM Pop Hits",
    album: "Hollywood Top 40",
    audioUrl: "https://stream.zeno.fm/z533604f6h8uv",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    duration: 99999,
    source: "Hollywood Radio"
  },
  {
    id: "radio-bbc-3",
    title: "BBC World Service Live News & Music",
    artist: "BBC Radio UK",
    album: "London Broadcast",
    audioUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400",
    duration: 99999,
    source: "BBC World Service"
  },
  {
    id: "radio-lofi-4",
    title: "Lofi Girl 24/7 Chill Beats Stream",
    artist: "Lofi Live Radio",
    album: "Non-Stop Study Beats",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400",
    duration: 99999,
    source: "Lofi World Stream"
  },
  {
    id: "radio-retro-5",
    title: "Old Hindi Classics 80s & 90s",
    artist: "Kishore, Lata, Asha & Rafi",
    album: "Golden Retro FM",
    audioUrl: "https://stream.zeno.fm/e29a99pghq8uv",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    duration: 99999,
    source: "Retro Bollywood Radio"
  }
];

export const TOP_REAL_CHARTS: Track[] = [
  ...LOFI_STUDY_TRACKS,
  {
    id: "real-1",
    title: "Blinding Lights (Remix)",
    artist: "The Weeknd & ROSALÍA",
    album: "Blinding Lights - Single",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/08/fe/de/08fede6c-762e-b24f-f4ff-a9e51bbde1cc/mzaf_6048815850106316934.plus.aac.p.m4a",
    imageUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/61/e7/3f/61e73f94-018d-5f50-50ec-8521952bc72e/20UM1IM11629.rgb.jpg/600x600bb.jpg",
    duration: 30,
    source: "iTunes Top Hits"
  },
  {
    id: "real-2",
    title: "Kesariya (From \"Brahmastra\")",
    artist: "Pritam, Arijit Singh & Amitabh Bhattacharya",
    album: "Kesariya - Single",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
    imageUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg",
    duration: 30,
    source: "Bollywood Top Chart"
  },
  {
    id: "real-3",
    title: "As It Was",
    artist: "Harry Styles",
    album: "Harry's House",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a",
    imageUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/600x600bb.jpg",
    duration: 30,
    source: "iTunes Top Hits"
  },
  {
    id: "real-4",
    title: "Apna Bana Le (From \"Bhediya\")",
    artist: "Arijit Singh, Sachin-Jigar & Amitabh Bhattacharya",
    album: "Apna Bana Le - Single",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/eb/27/61/eb2761c7-d606-0912-dff0-2dc6b69974bd/mzaf_2023722930851223219.plus.aac.p.m4a",
    imageUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/600x600bb.jpg",
    duration: 30,
    source: "Bollywood Top Chart"
  },
  {
    id: "real-5",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a",
    imageUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/600x600bb.jpg",
    duration: 30,
    source: "iTunes Top Hits"
  },
  {
    id: "real-6",
    title: "Starboy (feat. Daft Punk)",
    artist: "The Weeknd",
    album: "Starboy",
    audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/71/d6/1171d6ad-3c96-e027-2af6-58028426588c/mzaf_15137631797407745471.plus.aac.p.m4a",
    imageUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/600x600bb.jpg",
    duration: 30,
    source: "iTunes Top Hits"
  }
];
