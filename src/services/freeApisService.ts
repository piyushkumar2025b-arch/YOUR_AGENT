/**
 * Free Public APIs Service
 * Handles live fetch calls to public jokes APIs, facts, advice, quotes, crypto, and public API directories.
 */

export interface JokeItem {
  id: string;
  setup?: string;
  delivery?: string;
  joke?: string;
  category: string;
  source: string;
  rating?: number;
}

export interface AdviceItem {
  id: number;
  advice: string;
}

export interface QuoteItem {
  id: string | number;
  quote: string;
  author: string;
}

export interface FactItem {
  fact: string;
  type: "cat" | "dog" | "number" | "trivia";
}

export interface PublicApiEndpoint {
  id: string;
  name: string;
  category: "Humor" | "Trivia & Facts" | "Animals" | "Quotes & Wisdom" | "Crypto & Finance" | "Dev Tools" | "Weather & Nature";
  description: string;
  endpoint: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  authRequired: boolean;
  sampleCode: {
    curl: string;
    javascript: string;
    python: string;
  };
}

// Curated Fallback Jokes in case network is offline
const FALLBACK_JOKES: JokeItem[] = [
  {
    id: "fb-1",
    setup: "Why do programmers prefer dark mode?",
    delivery: "Because light attracts bugs!",
    category: "Programming",
    source: "Offline Library"
  },
  {
    id: "fb-2",
    setup: "There are 10 types of people in the world...",
    delivery: "Those who understand binary, and those who don't!",
    category: "Programming",
    source: "Offline Library"
  },
  {
    id: "fb-3",
    setup: "Why did the developer break up with C++?",
    delivery: "Because it didn't give them enough class!",
    category: "Programming",
    source: "Offline Library"
  },
  {
    id: "fb-4",
    joke: "Chuck Norris can divide by zero and unit test in production with 100% code coverage.",
    category: "Chuck Norris",
    source: "Offline Library"
  },
  {
    id: "fb-5",
    setup: "Why don't scientists trust atoms?",
    delivery: "Because they make up everything!",
    category: "Dad Joke",
    source: "Offline Library"
  },
  {
    id: "fb-6",
    setup: "What is a programmer's favorite place to hang out?",
    delivery: "Foo Bar!",
    category: "Programming",
    source: "Offline Library"
  },
  {
    id: "fb-7",
    joke: "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
    category: "Programming",
    source: "Offline Library"
  },
  {
    id: "fb-8",
    setup: "How many programmers does it take to change a light bulb?",
    delivery: "None. It's a hardware problem!",
    category: "Tech",
    source: "Offline Library"
  }
];

export const PUBLIC_API_DIRECTORY: PublicApiEndpoint[] = [
  {
    id: "jokeapi-v2",
    name: "JokeAPI v2",
    category: "Humor",
    description: "Multilingual joke delivery API supporting Programming, Misc, Pun, Spooky & Dark categories.",
    endpoint: "https://v2.jokeapi.dev/joke/Any?safe-mode",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://v2.jokeapi.dev/joke/Programming?safe-mode'",
      javascript: "fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode').then(res => res.json())",
      python: "import requests\nres = requests.get('https://v2.jokeapi.dev/joke/Programming?safe-mode').json()"
    }
  },
  {
    id: "official-joke-api",
    name: "Official Joke API",
    category: "Humor",
    description: "Lightweight, clean random joke generator serving setup & punchline jokes.",
    endpoint: "https://official-joke-api.appspot.com/random_joke",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://official-joke-api.appspot.com/random_joke'",
      javascript: "fetch('https://official-joke-api.appspot.com/random_joke').then(res => res.json())",
      python: "import requests\nres = requests.get('https://official-joke-api.appspot.com/random_joke').json()"
    }
  },
  {
    id: "icanhazdadjoke",
    name: "I Can Has Dad Joke API",
    category: "Humor",
    description: "The premier dad joke API with thousands of hilarious groan-worthy jokes.",
    endpoint: "https://icanhazdadjoke.com/",
    method: "GET",
    headers: { "Accept": "application/json" },
    authRequired: false,
    sampleCode: {
      curl: "curl -H 'Accept: application/json' https://icanhazdadjoke.com/",
      javascript: "fetch('https://icanhazdadjoke.com/', { headers: { Accept: 'application/json' } }).then(res => res.json())",
      python: "import requests\nres = requests.get('https://icanhazdadjoke.com/', headers={'Accept': 'application/json'}).json()"
    }
  },
  {
    id: "chuck-norris",
    name: "Chuck Norris Facts & Jokes",
    category: "Humor",
    description: "Hand-curated database of satirical Chuck Norris facts and martial arts jokes.",
    endpoint: "https://api.chucknorris.io/jokes/random",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.chucknorris.io/jokes/random'",
      javascript: "fetch('https://api.chucknorris.io/jokes/random').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.chucknorris.io/jokes/random').json()"
    }
  },
  {
    id: "advice-slip",
    name: "Advice Slip API",
    category: "Quotes & Wisdom",
    description: "Provides wisdom, actionable life advice, and daily encouraging thoughts.",
    endpoint: "https://api.adviceslip.com/advice",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.adviceslip.com/advice'",
      javascript: "fetch('https://api.adviceslip.com/advice').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.adviceslip.com/advice').json()"
    }
  },
  {
    id: "dummyjson-quotes",
    name: "DummyJSON Quotes API",
    category: "Quotes & Wisdom",
    description: "High quality quotes from famous historical figures, philosophers, and leaders.",
    endpoint: "https://dummyjson.com/quotes/random",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://dummyjson.com/quotes/random'",
      javascript: "fetch('https://dummyjson.com/quotes/random').then(res => res.json())",
      python: "import requests\nres = requests.get('https://dummyjson.com/quotes/random').json()"
    }
  },
  {
    id: "cat-facts",
    name: "Cat Facts Ninja API",
    category: "Animals",
    description: "Fascinating, verified feline trivia facts updated continuously.",
    endpoint: "https://catfact.ninja/fact",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://catfact.ninja/fact'",
      javascript: "fetch('https://catfact.ninja/fact').then(res => res.json())",
      python: "import requests\nres = requests.get('https://catfact.ninja/fact').json()"
    }
  },
  {
    id: "dog-facts",
    name: "Dog Facts API",
    category: "Animals",
    description: "Random dog breeds, characteristics, and canine trivia facts.",
    endpoint: "https://dog-api.kinduff.com/api/facts",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://dog-api.kinduff.com/api/facts'",
      javascript: "fetch('https://dog-api.kinduff.com/api/facts').then(res => res.json())",
      python: "import requests\nres = requests.get('https://dog-api.kinduff.com/api/facts').json()"
    }
  },
  {
    id: "coingecko-crypto",
    name: "CoinGecko Free Price API",
    category: "Crypto & Finance",
    description: "Live real-time market prices for Bitcoin, Ethereum, Solana, and major cryptocurrencies.",
    endpoint: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,dogecoin&vs_currencies=usd&include_24hr_change=true",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd'",
      javascript: "fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd').json()"
    }
  },
  {
    id: "nager-date-holidays",
    name: "Nager Date Worldwide Holidays API",
    category: "Dev Tools",
    description: "Public holidays API for over 90 countries with date boundaries.",
    endpoint: "https://date.nager.at/api/v3/NextPublicHolidaysWorldwide",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://date.nager.at/api/v3/NextPublicHolidaysWorldwide'",
      javascript: "fetch('https://date.nager.at/api/v3/NextPublicHolidaysWorldwide').then(res => res.json())",
      python: "import requests\nres = requests.get('https://date.nager.at/api/v3/NextPublicHolidaysWorldwide').json()"
    }
  },
  {
    id: "open-meteo-weather",
    name: "Open-Meteo Weather Forecast API",
    category: "Weather & Nature",
    description: "Free weather forecast API with temperature, precipitation, wind speed, and humidity.",
    endpoint: "https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current_weather=true",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current_weather=true'",
      javascript: "fetch('https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current_weather=true').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current_weather=true').json()"
    }
  },
  {
    id: "agify-io",
    name: "Agify.io Name Age Predictor API",
    category: "Trivia & Facts",
    description: "Estimates the average age of a person based on their given first name.",
    endpoint: "https://api.agify.io?name=manju",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.agify.io?name=manju'",
      javascript: "fetch('https://api.agify.io?name=manju').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.agify.io?name=manju').json()"
    }
  },
  {
    id: "dictionary-api",
    name: "Free English Dictionary API",
    category: "Dev Tools",
    description: "Definitions, phonetics, audio pronunciation, synonyms, and antonyms for any English word.",
    endpoint: "https://api.dictionaryapi.dev/api/v2/entries/en/developer",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.dictionaryapi.dev/api/v2/entries/en/developer'",
      javascript: "fetch('https://api.dictionaryapi.dev/api/v2/entries/en/developer').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.dictionaryapi.dev/api/v2/entries/en/developer').json()"
    }
  },
  {
    id: "exchange-rates-api",
    name: "ExchangeRate-API Live Forex",
    category: "Crypto & Finance",
    description: "Real-time currency exchange rates for 160+ fiat currencies against USD, EUR, INR, GBP.",
    endpoint: "https://open.er-api.com/v6/latest/USD",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://open.er-api.com/v6/latest/USD'",
      javascript: "fetch('https://open.er-api.com/v6/latest/USD').then(res => res.json())",
      python: "import requests\nres = requests.get('https://open.er-api.com/v6/latest/USD').json()"
    }
  },
  {
    id: "ip-geolocation-api",
    name: "IPwho.is Geolocation Telemetry",
    category: "Dev Tools",
    description: "Returns client IP address, city, region, country, ISP, and geographic coordinates without strict rate limits.",
    endpoint: "https://ipwho.is/",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://ipwho.is/'",
      javascript: "fetch('https://ipwho.is/').then(res => res.json())",
      python: "import requests\nres = requests.get('https://ipwho.is/').json()"
    }
  },
  {
    id: "github-user-api",
    name: "GitHub Public User API",
    category: "Dev Tools",
    description: "Fetches public profile stats, repository count, bio, and avatar for any GitHub developer.",
    endpoint: "https://api.github.com/users/octocat",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.github.com/users/octocat'",
      javascript: "fetch('https://api.github.com/users/octocat').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.github.com/users/octocat').json()"
    }
  },
  {
    id: "nasa-apod-api",
    name: "NASA Astronomy Picture of the Day",
    category: "Weather & Nature",
    description: "Daily high-res space imagery, nebula photography, and astronomical explanations directly from NASA.",
    endpoint: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY'",
      javascript: "fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY').json()"
    }
  },
  {
    id: "spaceflight-news-v4",
    name: "Spaceflight News API v4",
    category: "Weather & Nature",
    description: "Live aerospace, rocket launches, satellite deployments, and planetary exploration news from NASA, SpaceX, ESA.",
    endpoint: "https://api.spaceflightnewsapi.net/v4/articles/?limit=3",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.spaceflightnewsapi.net/v4/articles/?limit=3'",
      javascript: "fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=3').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.spaceflightnewsapi.net/v4/articles/?limit=3').json()"
    }
  },
  {
    id: "wikipedia-summary",
    name: "Wikipedia Official REST Summary API",
    category: "Dev Tools",
    description: "Real-time encyclopedic article summaries, thumbnails, and descriptions from Wikimedia Foundation.",
    endpoint: "https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence'",
      javascript: "fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence').then(res => res.json())",
      python: "import requests\nres = requests.get('https://en.wikipedia.org/api/rest_v1/page/summary/Artificial_intelligence').json()"
    }
  },
  {
    id: "datamuse-words",
    name: "Datamuse Lexical & Synonym API",
    category: "Dev Tools",
    description: "Natural language lexical dictionary engine finding synonyms, rhymes, definitions, and word frequencies.",
    endpoint: "https://api.datamuse.com/words?rel_syn=clever&max=5",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.datamuse.com/words?rel_syn=clever&max=5'",
      javascript: "fetch('https://api.datamuse.com/words?rel_syn=clever&max=5').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.datamuse.com/words?rel_syn=clever&max=5').json()"
    }
  },
  {
    id: "open-meteo-air-quality",
    name: "Open-Meteo Air Quality Index",
    category: "Weather & Nature",
    description: "Atmospheric sensor telemetry measuring US AQI, European AQI, PM2.5, PM10, Carbon Monoxide, and Ozone.",
    endpoint: "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.7749&longitude=-122.4194&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.7749&longitude=-122.4194&current=us_aqi,pm10,pm2_5'",
      javascript: "fetch('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.7749&longitude=-122.4194&current=us_aqi,pm10,pm2_5').then(res => res.json())",
      python: "import requests\nres = requests.get('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=37.7749&longitude=-122.4194&current=us_aqi,pm10,pm2_5').json()"
    }
  },
  {
    id: "frankfurter-fx-api",
    name: "Frankfurter European Central Bank FX",
    category: "Crypto & Finance",
    description: "Open-source foreign exchange rates published daily by the European Central Bank (ECB) with historical tracking.",
    endpoint: "https://api.frankfurter.dev/v1/latest?base=USD",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.frankfurter.dev/v1/latest?base=USD'",
      javascript: "fetch('https://api.frankfurter.dev/v1/latest?base=USD').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.frankfurter.dev/v1/latest?base=USD').json()"
    }
  },
  {
    id: "pokeapi-v2",
    name: "PokéAPI Open REST Endpoint",
    category: "Trivia & Facts",
    description: "Comprehensive public database of Pokémon species, abilities, moves, and game sprites.",
    endpoint: "https://pokeapi.co/api/v2/pokemon/pikachu",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://pokeapi.co/api/v2/pokemon/pikachu'",
      javascript: "fetch('https://pokeapi.co/api/v2/pokemon/pikachu').then(res => res.json())",
      python: "import requests\nres = requests.get('https://pokeapi.co/api/v2/pokemon/pikachu').json()"
    }
  },
  {
    id: "rick-and-morty-api",
    name: "Rick and Morty Show Universe API",
    category: "Trivia & Facts",
    description: "Multiverse character profiles, dimensions, episode air dates, and location guides.",
    endpoint: "https://rickandmortyapi.com/api/character/1",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://rickandmortyapi.com/api/character/1'",
      javascript: "fetch('https://rickandmortyapi.com/api/character/1').then(res => res.json())",
      python: "import requests\nres = requests.get('https://rickandmortyapi.com/api/character/1').json()"
    }
  },
  {
    id: "dog-ceo-api",
    name: "Dog CEO Breeds & Gallery API",
    category: "Animals",
    description: "Free curated dog photo and breed classification library maintained by open-source contributors.",
    endpoint: "https://dog.ceo/api/breeds/image/random",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://dog.ceo/api/breeds/image/random'",
      javascript: "fetch('https://dog.ceo/api/breeds/image/random').then(res => res.json())",
      python: "import requests\nres = requests.get('https://dog.ceo/api/breeds/image/random').json()"
    }
  },
  {
    id: "poetry-db",
    name: "PoetryDB Classical Poems",
    category: "Quotes & Wisdom",
    description: "Thousands of classical poems from Shakespeare, Shelley, Keats, Dickinson, and Byron.",
    endpoint: "https://poetrydb.org/title/Ozymandias/lines.json",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://poetrydb.org/title/Ozymandias/lines.json'",
      javascript: "fetch('https://poetrydb.org/title/Ozymandias/lines.json').then(res => res.json())",
      python: "import requests\nres = requests.get('https://poetrydb.org/title/Ozymandias/lines.json').json()"
    }
  },
  {
    id: "hackernews-api",
    name: "Official HackerNews Firebase API",
    category: "Dev Tools",
    description: "Y Combinator's official real-time Firebase API for tech news, discussions, and developer commentary.",
    endpoint: "https://hacker-news.firebaseio.com/v0/item/8863.json",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://hacker-news.firebaseio.com/v0/item/8863.json'",
      javascript: "fetch('https://hacker-news.firebaseio.com/v0/item/8863.json').then(res => res.json())",
      python: "import requests\nres = requests.get('https://hacker-news.firebaseio.com/v0/item/8863.json').json()"
    }
  },
  {
    id: "open-library-subjects",
    name: "Open Library Subjects API",
    category: "Dev Tools",
    description: "Millions of catalogued books, open-access texts, and library classification indices.",
    endpoint: "https://openlibrary.org/subjects/science_fiction.json?limit=2",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://openlibrary.org/subjects/science_fiction.json?limit=2'",
      javascript: "fetch('https://openlibrary.org/subjects/science_fiction.json?limit=2').then(res => res.json())",
      python: "import requests\nres = requests.get('https://openlibrary.org/subjects/science_fiction.json?limit=2').json()"
    }
  },
  {
    id: "bored-activity-api",
    name: "DummyJSON Task & Activity Generator",
    category: "Trivia & Facts",
    description: "Suggests fun, productive, or creative tasks and todos to attempt throughout the day.",
    endpoint: "https://dummyjson.com/todos/random",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://dummyjson.com/todos/random'",
      javascript: "fetch('https://dummyjson.com/todos/random').then(res => res.json())",
      python: "import requests\nres = requests.get('https://dummyjson.com/todos/random').json()"
    }
  },
  {
    id: "random-user-generator",
    name: "Random User Generator API",
    category: "Dev Tools",
    description: "Generates realistic dummy user accounts with names, emails, avatars, addresses, and phone numbers.",
    endpoint: "https://randomuser.me/api/",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://randomuser.me/api/'",
      javascript: "fetch('https://randomuser.me/api/').then(res => res.json())",
      python: "import requests\nres = requests.get('https://randomuser.me/api/').json()"
    }
  },
  {
    id: "open-trivia-db",
    name: "Open Trivia Database Quiz API",
    category: "Trivia & Facts",
    description: "Multiple choice quiz questions covering science, tech, history, film, and general knowledge.",
    endpoint: "https://opentdb.com/api.php?amount=5&type=multiple",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://opentdb.com/api.php?amount=5&type=multiple'",
      javascript: "fetch('https://opentdb.com/api.php?amount=5&type=multiple').then(res => res.json())",
      python: "import requests\nres = requests.get('https://opentdb.com/api.php?amount=5&type=multiple').json()"
    }
  },
  {
    id: "rest-countries-api",
    name: "REST Countries Worldwide API",
    category: "Trivia & Facts",
    description: "Information about country flags, capitals, populations, regions, and currencies.",
    endpoint: "https://restcountries.com/v3.1/name/japan",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://restcountries.com/v3.1/name/japan'",
      javascript: "fetch('https://restcountries.com/v3.1/name/japan').then(res => res.json())",
      python: "import requests\nres = requests.get('https://restcountries.com/v3.1/name/japan').json()"
    }
  },
  {
    id: "usgs-earthquakes",
    name: "USGS Earthquake Hazards Program",
    category: "Weather & Nature",
    description: "Real-time global seismic telemetry tracking earthquakes, focal depths, magnitudes, and tsunami alerts.",
    endpoint: "/api/earth/earthquakes?minmagnitude=3.0",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=3.0'",
      javascript: "fetch('/api/earth/earthquakes?minmagnitude=3.0').then(res => res.json())",
      python: "import requests\nres = requests.get('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=3.0').json()"
    }
  },
  {
    id: "iss-space-orbit",
    name: "ISS Real-Time Orbit & Crew Telemetry",
    category: "Weather & Nature",
    description: "Live latitude/longitude coordinates of the International Space Station and off-planet astronaut crew counts.",
    endpoint: "/api/space/iss",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'http://api.open-notify.org/iss-now.json'",
      javascript: "fetch('/api/space/iss').then(res => res.json())",
      python: "import requests\nres = requests.get('http://api.open-notify.org/iss-now.json').json()"
    }
  },
  {
    id: "noaa-weather-alerts",
    name: "NOAA National Weather Service Alerts",
    category: "Weather & Nature",
    description: "Active high-severity meteorological advisories, hurricanes, tornadoes, and flood watches across North America.",
    endpoint: "/api/weather/alerts",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.weather.gov/alerts/active?status=actual&message_type=alert'",
      javascript: "fetch('/api/weather/alerts').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.weather.gov/alerts/active').json()"
    }
  },
  {
    id: "open-food-facts",
    name: "Open Food Facts Worldwide Database",
    category: "Trivia & Facts",
    description: "Free crowdsourced food ingredient registry with Nutri-Score, allergens, additives, and barcode lookups.",
    endpoint: "/api/food/search?q=coffee",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=coffee&search_simple=1&action=process&json=1'",
      javascript: "fetch('/api/food/search?q=coffee').then(res => res.json())",
      python: "import requests\nres = requests.get('https://world.openfoodfacts.org/cgi/search.pl?search_terms=coffee&json=1').json()"
    }
  },
  {
    id: "world-bank-data",
    name: "World Bank Global Development Indicators",
    category: "Crypto & Finance",
    description: "Global macroeconomic metrics, population statistics, GDP trends, and emissions across 200+ nations.",
    endpoint: "/api/worldbank/indicator/SP.POP.TOTL",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json'",
      javascript: "fetch('/api/worldbank/indicator/SP.POP.TOTL').then(res => res.json())",
      python: "import requests\nres = requests.get('https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json').json()"
    }
  },
  {
    id: "cloudflare-speed-test",
    name: "Cloudflare Network Speed Test Telemetry",
    category: "Dev Tools",
    description: "Direct measurement of latency, jitter, download Mbps, and upload throughput using Cloudflare edge CDN endpoints.",
    endpoint: "/api/speedtest/download?size=1048576",
    method: "GET",
    authRequired: false,
    sampleCode: {
      curl: "curl -X GET 'https://speed.cloudflare.com/__down?bytes=1000000' -o /dev/null",
      javascript: "fetch('/api/speedtest/download?size=1048576').then(res => res.blob())",
      python: "import requests, time\nt0 = time.time(); requests.get('https://speed.cloudflare.com/__down?bytes=1000000'); print(time.time() - t0)"
    }
  }
];

/**
 * Fetch a joke from backend resilient endpoint with automatic fallback
 */
export async function fetchLiveJoke(category: string = "any"): Promise<JokeItem> {
  const cat = category.toLowerCase();

  try {
    const res = await fetch(`/api/jokes/random?category=${encodeURIComponent(cat)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id || `joke-${Date.now()}`,
        joke: data.joke,
        setup: data.setup,
        delivery: data.delivery,
        category: data.category || "Humor",
        source: data.source || "backend-proxy"
      };
    }
  } catch (err) {
    console.warn("Live joke fetch network issue, returning curated library item:", err);
  }

  // Fallback random selection
  const filtered = FALLBACK_JOKES.filter(j => cat === "any" || j.category.toLowerCase().includes(cat));
  const pool = filtered.length > 0 ? filtered : FALLBACK_JOKES;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Fetch advice slip from backend resilient endpoint
 */
export async function fetchLiveAdvice(): Promise<AdviceItem> {
  try {
    const res = await fetch("/api/advice/random");
    if (res.ok) {
      const data = await res.json();
      if (data.advice) {
        return {
          id: data.id || Math.floor(Math.random() * 1000),
          advice: data.advice
        };
      }
    }
  } catch (e) {
    console.warn("Advice API fallback triggered:", e);
  }
  return {
    id: Math.floor(Math.random() * 1000),
    advice: "Always write clean, modular code with clear comments and zero placeholders!"
  };
}

/**
 * Fetch quote from backend resilient endpoint
 */
export async function fetchLiveQuote(): Promise<QuoteItem> {
  try {
    const res = await fetch("/api/quotes/random");
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id || 101,
        quote: data.quote || "Simplicity is prerequisite for reliability.",
        author: data.author || "Edsger W. Dijkstra"
      };
    }
  } catch (e) {
    console.warn("Quote API fallback triggered:", e);
  }
  return {
    id: 101,
    quote: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra"
  };
}

/**
 * Fetch random fact from backend resilient endpoint
 */
export async function fetchLiveFact(type: "cat" | "dog" | "number" = "cat"): Promise<FactItem> {
  try {
    const res = await fetch(`/api/facts/random?type=${encodeURIComponent(type)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.fact) {
        return { fact: data.fact, type: data.type || type };
      }
    }
  } catch (e) {
    console.warn("Fact API fallback triggered:", e);
  }
  return {
    fact: type === "dog" ? "Dogs have three eyelids, including one called a nictitating membrane." : "Cats sleep for 70% of their lives on average.",
    type: type
  };
}

/**
 * Test a public endpoint live and return response status, timing, and formatted JSON output
 * Routes through backend proxy to avoid browser CORS restrictions
 */
export async function testPublicEndpointLive(endpoint: PublicApiEndpoint) {
  const startTime = performance.now();
  try {
    const targetUrl = endpoint.endpoint.startsWith("http")
      ? `/api/proxy?url=${encodeURIComponent(endpoint.endpoint)}`
      : endpoint.endpoint;

    const options: RequestInit = {
      method: endpoint.method,
      headers: endpoint.headers || {}
    };
    const res = await fetch(targetUrl, options);
    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const contentType = res.headers.get("content-type") || "";
    let parsedBody: any = null;
    if (contentType.includes("application/json")) {
      parsedBody = await res.json();
    } else {
      parsedBody = await res.text();
    }

    return {
      success: res.ok,
      status: res.status,
      statusText: res.statusText || "OK",
      durationMs,
      data: parsedBody
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      success: false,
      status: 0,
      statusText: "Network Error / CORS Restriction",
      durationMs: Math.round(endTime - startTime),
      data: { error: err.message || "Failed to fetch public endpoint" }
    };
  }
}
