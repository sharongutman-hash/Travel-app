export const CATEGORIES = {
  castle:    { label: "Castle / Fortress",    emoji: "🏰", color: "#7F77DD" },
  church:    { label: "Church / Monastery",   emoji: "⛪", color: "#D85A30" },
  museum:    { label: "Museum",               emoji: "🏛",  color: "#185FA5" },
  nature:    { label: "Nature / Outdoors",    emoji: "🌿", color: "#1D9E75" },
  city:      { label: "Old Town / City",      emoji: "🏙",  color: "#BA7517" },
  viewpoint: { label: "Viewpoint / Scenic",   emoji: "🌄", color: "#639922" },
};

// Main route stops — coords corrected from location database
export const STOPS = [
  {
    id: "otp",
    name: "Bucharest Airport (OTP)", shortName: "Bucharest",
    coords: [44.572, 26.102],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: "snagov",
    name: "Snagov", shortName: "Snagov",
    coords: [44.7095, 26.1530],   // Hotel Snagov Club coords
    image: "https://images.unsplash.com/photo-1566274360960-0b67d9498c04?w=600&q=80",
    region: "Ilfov County, Muntenia",
    about: "Snagov is a scenic commune built around Lake Snagov, the largest natural lake in Romania (600 ha, 16 km long). Famous as the legendary burial site of Vlad the Impaler (Dracula).",
    wikipedia: "https://en.wikipedia.org/wiki/Snagov",
  },
  {
    id: "sinaia",
    name: "Sinaia", shortName: "Sinaia",
    coords: [45.3535, 25.5520],   // Hotel Sinaia coords
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&q=80",
    region: "Prahova County, Muntenia",
    about: "Known as the 'Pearl of the Carpathians,' Sinaia is a royal mountain resort town nestled in the Bucegi Mountains. King Carol I built his summer residence Peleș Castle here.",
    wikipedia: "https://en.wikipedia.org/wiki/Sinaia",
  },
  {
    id: "brasov",
    name: "Brașov", shortName: "Brașov",
    coords: [45.6450, 25.5940],   // The Pines Boutique Villa coords
    image: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=600&q=80",
    region: "Brașov County, Transylvania",
    about: "One of Romania's most visited cities — a medieval jewel in the heart of Transylvania, surrounded by forested mountains. Known for its Gothic Black Church and proximity to Bran Castle.",
    wikipedia: "https://en.wikipedia.org/wiki/Bra%C8%99ov",
  },
  {
    id: "sibiu",
    name: "Sibiu / Gura Râului", shortName: "Sibiu",
    coords: [45.6700, 23.9150],   // Pensiunea La Vâltoare coords (Gura Râului, 18 km from Sibiu)
    image: "https://images.unsplash.com/photo-1571406252241-db0280bd36cd?w=600&q=80",
    region: "Sibiu County, Transylvania",
    about: "One of Romania's most beautifully preserved medieval cities (Hermannstadt). European Capital of Culture 2007. Staying in Gura Râului village, 18 km from Sibiu city center.",
    wikipedia: "https://en.wikipedia.org/wiki/Sibiu",
  },
  {
    id: "curtea",
    name: "Curtea de Argeș", shortName: "Curtea de Argeș",
    coords: [45.1392, 24.6792],   // Old Court coords
    image: "https://images.unsplash.com/photo-1601244005535-a48d21d951ac?w=600&q=80",
    region: "Argeș County, Muntenia",
    about: "One of the oldest towns in Wallachia and former medieval capital. The Royal Necropolis holds the tombs of Romanian kings. Gateway to the Transfăgărășan and Poienari Fortress.",
    wikipedia: "https://en.wikipedia.org/wiki/Curtea_de_Arge%C8%99",
  },
];

// All attractions from location database, with real coordinates
export const SPOTS = [
  // ── SNAGOV ─────────────────────────────────────────────────────────────────
  { id: 1,  name: "Snagov Monastery",              stop: "snagov", cat: "church",    coords: [44.7300, 26.1330], note: "14th-c. island monastery — legendary tomb of Vlad the Impaler. Reachable by boat." },
  { id: 2,  name: "Snagov Palace",                 stop: "snagov", cat: "castle",    coords: [44.7150, 26.1300], note: "Former royal palace built by Prince Nicholas of Romania in 1928." },
  { id: 3,  name: "Snagov Lake",                   stop: "snagov", cat: "nature",    coords: [44.7250, 26.1480], note: "Largest natural lake in Romania (600 ha, 16 km long). Motorboat tours available." },
  { id: 4,  name: "Snagov Natural Complex Reserve",stop: "snagov", cat: "nature",    coords: [44.7100, 26.1600], note: "1,147 ha nature reserve — lake and old oak forests." },
  { id: 5,  name: "Snagov Eco-Tourism Center",     stop: "snagov", cat: "nature",    coords: [44.7200, 26.1450], note: "Bike rentals, kayaks, audio-guided boat tours, 5 cycling circuits." },
  { id: 6,  name: "Snagov Museum",                 stop: "snagov", cat: "museum",    coords: [44.7080, 26.1520], note: "Collections on 130 personalities connected to Snagov. Opened 2008." },

  // ── SINAIA ─────────────────────────────────────────────────────────────────
  { id: 7,  name: "Peleș Castle",                  stop: "sinaia", cat: "castle",    coords: [45.3600, 25.5370], note: "Neo-Renaissance royal palace — Tripadvisor #1 attraction in Sinaia." },
  { id: 8,  name: "Pelișor Castle",                stop: "sinaia", cat: "castle",    coords: [45.3610, 25.5360], note: "Art Nouveau royal retreat, built for King Ferdinand I and Queen Marie." },
  { id: 9,  name: "Sinaia Monastery",              stop: "sinaia", cat: "church",    coords: [45.3510, 25.5490], note: "Founded 1695 — the namesake of the town. Beautiful Orthodox complex." },
  { id: 10, name: "Sinaia Casino",                 stop: "sinaia", cat: "city",      coords: [45.3500, 25.5520], note: "Historic 1913 Belle Époque building, now a conference center." },
  { id: 11, name: "Bucegi Cable Car",              stop: "sinaia", cat: "viewpoint", coords: [45.3490, 25.5470], note: "Connects resort with Cota 1,400 and Cota 2,000 mountain platforms." },
  { id: 12, name: "Bucegi Natural Park",           stop: "sinaia", cat: "nature",    coords: [45.3960, 25.4670], note: "326 km² of protected mountain terrain, hiking trails, alpine flora." },
  { id: 13, name: "George Enescu Memorial House",  stop: "sinaia", cat: "museum",    coords: [45.3520, 25.5480], note: "Villa of Romania's greatest composer." },

  // ── BRAȘOV ─────────────────────────────────────────────────────────────────
  { id: 14, name: "Black Church",                  stop: "brasov", cat: "church",    coords: [45.6410, 25.5880], note: "14th–15th c. Gothic church — the largest Gothic church in Romania." },
  { id: 15, name: "Council Square (Piața Sfatului)",stop: "brasov", cat: "city",     coords: [45.6420, 25.5890], note: "The stunning medieval heart of the old town." },
  { id: 16, name: "Catherine's Gate",              stop: "brasov", cat: "castle",    coords: [45.6480, 25.5850], note: "The only surviving original medieval city gate." },
  { id: 17, name: "Tampa Mountain",                stop: "brasov", cat: "viewpoint", coords: [45.6370, 25.6050], note: "900 m peak — cable car or hike up for panoramic views of the city." },
  { id: 18, name: "Bran Castle",                   stop: "brasov", cat: "castle",    coords: [45.5130, 25.3700], note: "'Dracula's Castle' — Gothic fortress, 30 min from Brașov." },
  { id: 19, name: "Poiana Brașov",                 stop: "brasov", cat: "nature",    coords: [45.5930, 25.5490], note: "Top ski resort and nature area, 12 km from the city." },
  { id: 20, name: "Râșnov Fortress",               stop: "brasov", cat: "castle",    coords: [45.5890, 25.4590], note: "Restored medieval peasant fortress above the town of Râșnov." },
  { id: 21, name: "Libearty Bear Sanctuary",       stop: "brasov", cat: "nature",    coords: [45.5670, 25.3080], note: "One of the largest bear sanctuaries in Europe (Zărnești)." },
  { id: 22, name: "First Romanian School Museum",  stop: "brasov", cat: "museum",    coords: [45.6390, 25.5840], note: "Home to Romania's first printing press." },
  { id: 23, name: "Rope Street",                   stop: "brasov", cat: "city",      coords: [45.6430, 25.5910], note: "The narrowest street in Romania." },
  { id: 24, name: "St. Nicholas Church (Șchei)",   stop: "brasov", cat: "church",    coords: [45.6370, 25.5830], note: "14th c. Orthodox church in the historic Romanian neighborhood." },

  // ── SIBIU ──────────────────────────────────────────────────────────────────
  { id: 25, name: "Piața Mare (Great Square)",     stop: "sibiu",  cat: "city",      coords: [45.7970, 24.1500], note: "The grand main square surrounded by Baroque and Renaissance buildings." },
  { id: 26, name: "Bridge of Lies",                stop: "sibiu",  cat: "city",      coords: [45.7960, 24.1510], note: "Romania's first cast-iron bridge (1859) with a famous local legend." },
  { id: 27, name: "Saint Mary Evangelical Church", stop: "sibiu",  cat: "church",    coords: [45.7970, 24.1490], note: "Gothic Lutheran church — the most important in Transylvania." },
  { id: 28, name: "Brukenthal National Museum",    stop: "sibiu",  cat: "museum",    coords: [45.7970, 24.1500], note: "Art, History, Pharmacy & Natural History museums in a Baroque palace." },
  { id: 29, name: "ASTRA Open Air Museum",         stop: "sibiu",  cat: "museum",    coords: [45.7730, 24.1210], note: "96-hectare open-air ethnography museum in Dumbrava Forest." },
  { id: 30, name: "Dumbrava Sibiului Natural Park",stop: "sibiu",  cat: "nature",    coords: [45.7750, 24.1180], note: "960 ha forest park, 4 km from city center." },
  { id: 31, name: "Council Tower & Stairs Tower",  stop: "sibiu",  cat: "viewpoint", coords: [45.7970, 24.1510], note: "Medieval watchtowers with panoramic views over the old town." },
  { id: 32, name: "Transfăgărășan Highway",        stop: "sibiu",  cat: "viewpoint", coords: [45.6020, 24.6180], note: "'Best road in the world' (Top Gear). ~45 min from Sibiu." },
  { id: 33, name: "Păltiniș Ski Resort",           stop: "sibiu",  cat: "nature",    coords: [45.6400, 23.9300], note: "19 km from the guesthouse at Gura Râului." },
  { id: 34, name: "Sighișoara (day trip)",         stop: "sibiu",  cat: "city",      coords: [46.2200, 24.7930], note: "Dracula's birthplace — UNESCO World Heritage medieval fortress town. 1 hr from Sibiu." },

  // ── CURTEA DE ARGEȘ ────────────────────────────────────────────────────────
  { id: 35, name: "Curtea de Argeș Cathedral",     stop: "curtea", cat: "church",    coords: [45.1430, 24.6740], note: "Romania's most important Orthodox site & Royal Necropolis (tombs of Romanian kings)." },
  { id: 36, name: "Princely Court (Curtea Domnească)", stop: "curtea", cat: "castle", coords: [45.1400, 24.6780], note: "Ruins of the medieval Wallachian royal palace with 14th-c. St. Nicholas Church." },
  { id: 37, name: "Vidraru Dam & Lake",            stop: "curtea", cat: "viewpoint", coords: [45.3520, 24.6220], note: "One of the largest dams in Romania — dramatic lake and mountain scenery. 30 km away." },
  { id: 38, name: "Transfăgărășan Highway (south)",stop: "curtea", cat: "viewpoint", coords: [45.3000, 24.6000], note: "Tripadvisor #1 in the area. Iconic mountain road starts near Curtea de Argeș." },
  { id: 39, name: "Poienari Fortress",             stop: "curtea", cat: "castle",    coords: [45.3550, 24.6380], note: "The REAL castle of Vlad the Impaler — ruins atop a cliff via 1,480 steps." },
  { id: 40, name: "Bâlea Lake & Waterfall",        stop: "curtea", cat: "nature",    coords: [45.6010, 24.6170], note: "High-altitude glacial lake accessible via the Transfăgărășan." },
  { id: 41, name: "Museum of Art & Argeș County",  stop: "curtea", cat: "museum",    coords: [45.1380, 24.6750], note: "Local history, art and cultural heritage of the Argeș region." },
];

// Hotels with full contact details
export const HOTELS = {
  snagov: {
    name: "Hotel Snagov Club",
    address: "Strada Aleea Nufărului nr. 1B, Snagov Sat, Ilfov, 077165",
    phone: "+40 728 210 075",
    fax: "+40 21 352 61 53",
    email: "reservation@snagovclub.ro",
    website: "https://snagovclub.ro",
    mapsUrl: "https://maps.google.com/?q=Snagov+Club+Aleea+Nufarului+1B+Snagov+Romania",
    coords: [44.7095, 26.1530],
    about: "Award-winning boutique hotel on the shores of Lake Snagov. Private terrace, boat riding, kayak and bike rentals.",
    nights: 1, rooms: 4, price: "₪2,183", cancellation: "No refund", confirmed: true,
    dates: "Aug 6 → Aug 7",
  },
  sinaia: {
    name: "Hotel Sinaia",
    address: "Bd. Carol I, Nr. 8, Sinaia, Prahova 106100",
    phone: "+40 244 302 900",
    email: "rezervari@hotelsinaia.ro",
    website: "https://www.hotelsinaia.ro",
    mapsUrl: "https://maps.google.com/?q=Hotel+Sinaia+Bd+Carol+I+8+Sinaia+Romania",
    coords: [45.3535, 25.5520],
    about: "Mountain hotel centrally located on Sinaia's main boulevard.",
    nights: 2, rooms: 4, price: "₪5,881", cancellation: "Free cancellation", confirmed: true,
    dates: "Aug 7 → Aug 9",
  },
  brasov: {
    name: "The Pines Boutique Villa",
    address: "Str. Cloșca, nr. 44, Brașov, 500040",
    phone: "+40 738 124 966",
    email: "brasov@thepines.ro",
    website: "https://thepines.ro/the-pines-brasov-en",
    mapsUrl: "https://maps.google.com/?q=The+Pines+Boutique+Villa+Str+Closca+44+Brasov+Romania",
    coords: [45.6450, 25.5940],
    about: "Small luxury boutique villa, Scandinavian/Nordic style. Rated 9.6/10 on Booking.com (273 reviews). #1 boutique villa in Brașov.",
    nights: 2, rooms: 4, price: "₪5,790", cancellation: "Free cancellation", confirmed: true,
    dates: "Aug 9 → Aug 11",
  },
  sibiu: {
    name: "Pensiunea La Vâltoare",
    address: "Str. Mărăjdiei, Nr. 9, Gura Râului, Sibiu",
    phone: "+40 753 999 960",
    email: "rezervari@valtoare.ro",
    website: "https://valtoare.ro",
    mapsUrl: "https://maps.google.com/?q=Pensiunea+La+Valtoare+Str+Marajdiei+9+Gura+Raului+Sibiu+Romania",
    coords: [45.6700, 23.9150],
    about: "Rural guesthouse in Gura Râului village, 18 km from Sibiu city. Mountain setting at the foothills of Cindrel Mountains. Features sauna & restaurant. Rated 9.8/10 on Booking.com (136 reviews).",
    nights: 3, rooms: 4, price: "₪10,012", cancellation: "Free cancellation", confirmed: true,
    dates: "Aug 11 → Aug 14",
    note: "18 km from Sibiu city center",
  },
  curtea: {
    name: "Old Court",
    address: "Strada Lascăr Catargiu 19, 115300 Curtea de Argeș",
    phone: "+40 749 761 768",
    website: "https://www.booking.com/hotel/the-old-court-1830",
    mapsUrl: "https://maps.google.com/?q=Old+Court+Strada+Laskar+Catargiu+19+Curtea+de+Arges+Romania",
    coords: [45.1392, 24.6792],
    about: "Historic guesthouse in a beautiful old building with garden views, BBQ and charming courtyard. 30 km from Vidraru Dam. Rated 9.4/10 on Booking.com (996 reviews).",
    nights: 2, rooms: 5, price: "₪2,048", cancellation: "Free cancellation", confirmed: true,
    dates: "Aug 14 → Aug 16",
  },
};

export const trip = {
  title: "Romania Road Trip",
  subtitle: "10 days through Transylvania",
  heroImage: "https://images.unsplash.com/photo-1601244005535-a48d21d951ac?w=1200&q=80",
  dates: "Aug 6 – 16, 2026",
  totalKm: 638,
  flight: {
    outbound: { number: "LY573",  from: "TLV", to: "BUH", date: "Thu, Aug 6",  departs: "04:45", arrives: "07:25", bookingRef: "7IGKV6" },
    return:   { number: "LY9492", from: "BUH", to: "TLV", date: "Sun, Aug 16", departs: "20:45", arrives: "23:20", bookingRef: "7ILXY6" },
  },
  car: {
    pickup: { location: "Bucharest Otopeni Airport (OTP)", time: "11:00 AM", date: "Thu, Aug 6" },
    return: { location: "Bucharest Otopeni Airport (OTP)", time: "4:30 PM",  date: "Sun, Aug 16" },
  },
  days: [
    {
      id: 1, date: "Thu, Aug 6", type: "travel",
      from: "Bucharest Airport (OTP)", to: "Snagov",
      arrival: { flight: "LY573", lands: "07:25", carPickup: "11:00 AM" },
      drive: { duration: "35 min", distance: "40 km", route: "A3 north" },
      hotelId: "snagov", stopId: "snagov",
      summary: "Land in Bucharest at 07:25, pick up the car at 11:00 and head to Snagov — only 40 km north. 1 night at Hotel Snagov Club on the shores of Lake Snagov. Afternoon walk around the lake and visit to the famous monastery — Vlad the Impaler's legendary tomb.",
    },
    {
      id: 2, date: "Fri, Aug 7", type: "travel",
      from: "Snagov", to: "Sinaia",
      drive: { duration: "1 h 30 min", distance: "120 km", route: "A3 → DN1" },
      hotelId: "sinaia", stopId: "sinaia",
      summary: "Morning drive 120 km south into the Carpathians. Arrive Sinaia and check in to Hotel Sinaia on the main boulevard. Afternoon visit to the stunning Peleș Castle — one of Romania's crown jewels and Tripadvisor #1 in Sinaia.",
    },
    {
      id: 3, date: "Sat, Aug 8", type: "stay", location: "Sinaia",
      hotelId: "sinaia", stopId: "sinaia",
      summary: "Full day in Sinaia. Pelișor Castle in the morning (Art Nouveau, built for Queen Marie), cable car up to Cota 2,000 for panoramic Carpathian views. Evening stroll through Sinaia Monastery complex.",
    },
    {
      id: 4, date: "Sun, Aug 9", type: "travel",
      from: "Sinaia", to: "Brașov",
      drive: { duration: "45 min", distance: "48 km", route: "DN1" },
      hotelId: "brasov", stopId: "brasov",
      summary: "Short 45-min drive to Brașov. Check in to The Pines Boutique Villa (rated #1 in Brașov). Explore the famous medieval Old Town — Council Square and the towering Black Church. Evening walk to Catherine's Gate.",
    },
    {
      id: 5, date: "Mon, Aug 10", type: "stay", location: "Brașov",
      hotelId: "brasov", stopId: "brasov",
      summary: "Day trip to Bran Castle ('Dracula's Castle') and nearby Râșnov Fortress — both within 30 min. Consider the Libearty Bear Sanctuary in Zărnești. Back in the evening to explore Rope Street, the narrowest street in Romania.",
    },
    {
      id: 6, date: "Tue, Aug 11", type: "travel",
      from: "Brașov", to: "Sibiu / Gura Râului",
      drive: { duration: "2 h 30 min", distance: "170 km", route: "DN1 via Transfăgărășan — scenic!" },
      hotelId: "sibiu", stopId: "sibiu",
      summary: "The most scenic drive of the trip — Transfăgărășan highway cuts through the highest peaks of the Carpathians. Arrive at Pensiunea La Vâltoare in Gura Râului village, 18 km from Sibiu. 3 nights here at this 9.8-rated guesthouse.",
    },
    {
      id: 7, date: "Wed, Aug 12", type: "stay", location: "Sibiu",
      hotelId: "sibiu", stopId: "sibiu",
      summary: "Full day in Sibiu — one of Europe's most beautiful medieval cities. Start at Piața Mare (Great Square), visit Brukenthal Museum, cross the famous Bridge of Lies, and climb the Council Tower for views over the terracotta rooftops.",
    },
    {
      id: 8, date: "Thu, Aug 13", type: "stay", location: "Sibiu",
      hotelId: "sibiu", stopId: "sibiu",
      summary: "Day trip to Sighișoara — Dracula's birthplace and UNESCO World Heritage site, only 1 hour away. Explore the fortified old town on the hill. Return to Sibiu for the vast ASTRA Open Air Museum in Dumbrava Forest.",
    },
    {
      id: 9, date: "Fri, Aug 14", type: "travel",
      from: "Sibiu / Gura Râului", to: "Curtea de Argeș",
      drive: { duration: "2 h", distance: "100 km", route: "DN7C → DN7 (via Transfăgărășan possible)" },
      hotelId: "curtea", stopId: "curtea",
      summary: "Drive through the Olt valley to Curtea de Argeș — the former medieval capital of Wallachia. Check in to Old Court (9.4 rated, 996 reviews). Afternoon visit to the magnificent Curtea de Argeș Cathedral, Romania's Royal Necropolis.",
    },
    {
      id: 10, date: "Sat, Aug 15", type: "stay", location: "Curtea de Argeș",
      hotelId: "curtea", stopId: "curtea",
      summary: "Drive to Poienari Citadel — the REAL Dracula fortress (1,480 steps up a cliff!). Then to Vidraru Dam with dramatic lake scenery. The full Transfăgărășan road is accessible from here. Last evening of the trip.",
    },
    {
      id: 11, date: "Sun, Aug 16", type: "travel",
      from: "Curtea de Argeș", to: "Bucharest Airport (OTP)",
      drive: { duration: "2 h", distance: "160 km", route: "DN7 → A1" },
      departure: { carReturn: "4:30 PM", flight: "LY9492", departs: "20:45" },
      hotelId: null, stopId: "otp",
      summary: "Head back to Bucharest. Return the car at OTP by 4:30 PM. 4+ hours buffer before LY9492 departs at 20:45. Lands Tel Aviv 23:20. End of trip.",
    },
  ],
};

export function getDayRangeByStop() {
  const map = {}
  trip.days.forEach(d => {
    if (!d.stopId || d.stopId === 'otp') return
    if (!map[d.stopId]) map[d.stopId] = []
    map[d.stopId].push(d.id)
  })
  const result = {}
  Object.entries(map).forEach(([stopId, ids]) => {
    const min = Math.min(...ids), max = Math.max(...ids)
    result[stopId] = min === max ? `Day ${min}` : `Day ${min}–${max}`
  })
  return result
}
