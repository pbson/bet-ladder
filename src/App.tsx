import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type CSSProperties,
  useRef,
} from "react";

// --- TYPES ---
interface Team {
  id: string;
  name: string;
  logo: string;
  players: string[];
}

interface Game {
  id: string;
  competition: string;
  home: Team;
  away: Team;
}

interface Score {
  home: number;
  away: number;
}

type EventType = "GOAL" | "CHANCE" | "SAVE";

interface LiveEvent {
  id: number;
  type: EventType;
  text: string;
  game: string;
  minute: number;
}

type CelebrationType = "GOAL" | "JACKPOT" | "ROW_WIN" | "COLUMN_WIN";

interface CelebrationState {
  type: CelebrationType;
  text?: string;
  amount?: number;
}

interface CompletedLines {
  rows: number[];
  cols: number[];
}

interface GoalThreshold {
  value: number;
  multiplier: number;
}

interface Winnings {
  id: string;
  amount: number;
}

// --- MOCK DATA & CONFIGURATION ---
const MOCK_TEAMS: Team[] = [
  {
    id: "1",
    name: "Man Utd",
    logo: "https://1000logos.net/wp-content/uploads/2017/03/Manchester-United-Logo.png",
    players: ["Fernandes", "Rashford", "Garnacho"],
  },
  {
    id: "2",
    name: "Chelsea",
    logo: "https://ssl.gstatic.com/onebox/media/sports/logos/fhBITrIlbQxhVB6IjxUO6Q_96x96.png",
    players: ["Palmer", "Sterling", "Jackson"],
  },
  {
    id: "3",
    name: "Liverpool",
    logo: "https://ssl.gstatic.com/onebox/media/sports/logos/0iShHhASp5q1SL4JhtwJiw_96x96.png",
    players: ["Salah", "Núñez", "Diaz"],
  },
  {
    id: "4",
    name: "Arsenal",
    logo: "https://ssl.gstatic.com/onebox/media/sports/logos/4us2nCgl6kgZc0t3hpW75Q_96x96.png",
    players: ["Saka", "Ødegaard", "Martinelli"],
  },
  {
    id: "5",
    name: "Man City",
    logo: "https://1000logos.net/wp-content/uploads/2017/05/Manchester-City-Logo.png",
    players: ["Haaland", "De Bruyne", "Foden"],
  },
  {
    id: "6",
    name: "Spurs",
    logo: "https://1000logos.net/wp-content/uploads/2018/06/Tottenham-Hotspur-Logo.png",
    players: ["Son", "Maddison", "Kulusevski"],
  },
  {
    id: "7",
    name: "Real Madrid",
    logo: "https://1000logos.net/wp-content/uploads/2020/09/Real-Madrid-logo.png",
    players: ["Bellingham", "Vini Jr.", "Rodrygo"],
  },
  {
    id: "8",
    name: "Barcelona",
    logo: "https://1000logos.net/wp-content/uploads/2016/10/Barcelona-Logo.png",
    players: ["Lewandowski", "Gündoğan", "Pedri"],
  },
  {
    id: "9",
    name: "Bayern",
    logo: "https://1000logos.net/wp-content/uploads/2018/05/Bayern-Munchen-Logo.png",
    players: ["Kane", "Musiala", "Kimmich"],
  },
  {
    id: "10",
    name: "Dortmund",
    logo: "https://1000logos.net/wp-content/uploads/2017/08/BVB-Logo.png",
    players: ["Reus", "Brandt", "Hummels"],
  },
  {
    id: "11",
    name: "Juventus",
    logo: "https://1000logos.net/wp-content/uploads/2021/05/Juventus-logo.png",
    players: ["Vlahović", "Chiesa", "Rabiot"],
  },
  {
    id: "12",
    name: "AC Milan",
    logo: "https://1000logos.net/wp-content/uploads/2016/10/AC-Milan-Logo.png",
    players: ["Leão", "Giroud", "Pulisic"],
  },
];

const MOCK_COMPETITIONS = {
  prem: "Premier League",
  fa_cup: "FA Cup",
  la_liga: "La Liga",
  serie_a: "Serie A",
  bundesliga: "Bundesliga",
};

const MOCK_GAMES: Game[] = [
  { id: "g1", competition: "prem", home: MOCK_TEAMS[0], away: MOCK_TEAMS[5] },
  { id: "g2", competition: "prem", home: MOCK_TEAMS[2], away: MOCK_TEAMS[3] },
  { id: "g3", competition: "fa_cup", home: MOCK_TEAMS[4], away: MOCK_TEAMS[1] },
  {
    id: "g4",
    competition: "la_liga",
    home: MOCK_TEAMS[6],
    away: MOCK_TEAMS[7],
  },
  {
    id: "g5",
    competition: "serie_a",
    home: MOCK_TEAMS[10],
    away: MOCK_TEAMS[11],
  },
  {
    id: "g6",
    competition: "bundesliga",
    home: MOCK_TEAMS[8],
    away: MOCK_TEAMS[9],
  },
  { id: "g7", competition: "prem", home: MOCK_TEAMS[1], away: MOCK_TEAMS[2] },
  { id: "g8", competition: "prem", home: MOCK_TEAMS[3], away: MOCK_TEAMS[4] },
  {
    id: "g9",
    competition: "la_liga",
    home: MOCK_TEAMS[7],
    away: MOCK_TEAMS[9],
  },
  {
    id: "g10",
    competition: "serie_a",
    home: MOCK_TEAMS[11],
    away: MOCK_TEAMS[8],
  },
];

const GOAL_THRESHOLDS: GoalThreshold[] = [
  { value: 1, multiplier: 1.5 },
  { value: 2, multiplier: 2.5 },
  { value: 3, multiplier: 4.0 },
  { value: 4, multiplier: 8.0 },
  { value: 5, multiplier: 15.0 },
];
const ROW_PRIZE_MULTIPLIER = 5.0;

// --- ICONS ---
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-white"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const FootballIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 45 45"
    xmlSpace="preserve"
    stroke="#ffffff"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <g>
        {" "}
        <g>
          {" "}
          <path d="M22.5,0C10.093,0,0,10.095,0,22.5C0,34.905,10.093,45,22.5,45S45,34.905,45,22.5C45,10.095,34.907,0,22.5,0z M39.208,34.098H32.18l-2.67-2.976l-0.293-5.585l3.61-4.456l4.455-2.176l5.552,4.038C42.744,27.081,41.422,30.918,39.208,34.098z M12.819,34.098H5.792c-2.214-3.18-3.536-7.017-3.625-11.153l5.552-4.04l4.455,2.177l3.611,4.456l-0.293,5.585L12.819,34.098z M38.686,10.201l-2.174,6.698l-4.479,2.184l-5.383-1.44l-3.08-4.748V7.393L29.204,3.3C33.005,4.631,36.287,7.058,38.686,10.201z M15.796,3.3l5.632,4.093v5.502l-3.079,4.748l-5.382,1.44l-4.479-2.188l-2.173-6.693C8.711,7.058,11.994,4.631,15.796,3.3z M16.641,41.986l-2.134-6.563l2.66-2.96l5.226-2.043l5.445,2.048l2.653,2.956l-2.132,6.563c-1.857,0.561-3.821,0.869-5.859,0.869 C20.463,42.855,18.499,42.548,16.641,41.986z"></path>{" "}
        </g>{" "}
      </g>{" "}
    </g>
  </svg>
);
const ResetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M15.312 11.424a5.5 5.5 0 01-9.204-4.592l-1.34-1.339a7 7 0 1010.363 6.138l-1.026-.814zM10 4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.25A.75.75 0 0110 4.5z"
      clipRule="evenodd"
    />
  </svg>
);
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path>
  </svg>
);
const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75zM14.25 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z"></path>
  </svg>
);
const FastForwardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M2 10a.75.75 0 01.75-.75h12.55l-2.47-2.47a.75.75 0 011.06-1.06l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H2.75A.75.75 0 012 10z"
      clipRule="evenodd"
    />
  </svg>
);
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);
const TrashIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);
const ChevronUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
      clipRule="evenodd"
    />
  </svg>
);

// --- ANIMATION & UI COMPONENTS ---
const EventTickerIcon = ({ type }: { type: EventType }) => {
  const icons: Record<EventType, { icon: string; color: string }> = {
    GOAL: { icon: "⚽", color: "bg-green-100 text-green-600" },
    CHANCE: { icon: "🎯", color: "bg-blue-100 text-blue-600" },
    SAVE: { icon: "🧤", color: "bg-yellow-100 text-yellow-600" },
  };
  const { icon, color } = icons[type] || { icon: "⚡", color: "bg-gray-100" };
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${color} text-lg shrink-0`}
    >
      {icon}
    </div>
  );
};

const CelebrationOverlay = ({
  type,
  text,
  amount,
  onAnimationEnd,
}: {
  type: CelebrationType;
  text?: string;
  amount?: number;
  onAnimationEnd: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onAnimationEnd, 2500);
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  const isJackpot = type === "JACKPOT";
  const isWin = type === "ROW_WIN" || type === "COLUMN_WIN";
  const title = isJackpot ? "JACKPOT!" : isWin ? "WINNER!" : "GOAL!";
  const mainColor = isJackpot ? "#fff" : isWin ? "#f59e0b" : "#009933";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none overflow-hidden animate-fade-in">
      <div
        className={`absolute inset-0 ${
          isJackpot ? "bg-[#003366]" : "bg-black/60"
        }`}
      ></div>
      {[...Array(isJackpot ? 100 : 50)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 1.5}s`,
            backgroundColor: ["#ffc700", "#009933", "#ffffff"][i % 3],
          }}
        ></div>
      ))}
      <div className="text-center z-10 animate-celebration-zoom">
        <h1
          className={`font-black ${
            isJackpot ? "text-8xl text-yellow-400" : "text-7xl text-white"
          }`}
          style={{ WebkitTextStroke: `4px ${mainColor}` }}
        >
          {title}
        </h1>
        <p
          className={`font-bold text-white mt-2 ${
            isJackpot ? "text-5xl" : "text-2xl"
          }`}
        >
          {isJackpot ? `$${amount?.toLocaleString()}` : text}
        </p>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="bg-slate-900/80 backdrop-blur-sm flex justify-between items-center p-4 shadow-lg sticky top-0 z-20 border-b-2 border-slate-700">
    <img
      src="https://cdn.boylesports.com/sportsbook-v5/sports_logo.svg"
      alt="Logo"
      className="h-8"
    />
    <MenuIcon />
  </header>
);

const GameSetup = ({
  onStartGame,
}: {
  onStartGame: (games: Game[], stake: number) => void;
}) => {
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [stake, setStake] = useState(10);
  const [competitionSearch, setCompetitionSearch] = useState("");
  const [matchSearches, setMatchSearches] = useState<{ [key: string]: string }>(
    {}
  );
  const [expandedCompetitions, setExpandedCompetitions] = useState<string[]>([
    "prem",
  ]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const quickStakeAmounts = [5, 10, 25, 50];

  const handleSelectGame = (game: Game) => {
    setSelectedGames((prev) => {
      if (prev.some((g) => g.id === game.id)) {
        return prev.filter((g) => g.id !== game.id);
      }
      if (prev.length === 0) {
        setIsSlipOpen(true);
      }
      return prev.length < 3 ? [...prev, game] : prev;
    });
  };

  const clearSlip = () => {
    setSelectedGames([]);
    setStake(10);
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setStake(isNaN(value) || value < 1 ? 1 : value);
  };

  const handleMatchSearchChange = (competitionKey: string, value: string) => {
    setMatchSearches((prev) => ({ ...prev, [competitionKey]: value }));
  };

  const toggleCompetition = (competitionKey: string) => {
    setExpandedCompetitions((prev) =>
      prev.includes(competitionKey)
        ? prev.filter((k) => k !== competitionKey)
        : [...prev, competitionKey]
    );
  };

  const filteredCompetitions = Object.entries(MOCK_COMPETITIONS).filter(
    ([, name]) => name.toLowerCase().includes(competitionSearch.toLowerCase())
  );

  const isReady = selectedGames.length === 3;

  return (
    <>
      <div className="bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-700 p-4">
        <h2 className="text-xl font-bold text-slate-100 mb-3">
          Pick Your Games
        </h2>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search competitions..."
            value={competitionSearch}
            onChange={(e) => setCompetitionSearch(e.target.value)}
            className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg p-3 pl-10 text-base text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2 max-h-96 lg:max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
          {filteredCompetitions.map(([key, name]) => {
            const isExpanded = expandedCompetitions.includes(key);
            const competitionGames = MOCK_GAMES.filter(
              (g) => g.competition === key
            );
            const filteredMatches = competitionGames.filter((g) =>
              `${g.home.name} vs ${g.away.name}`
                .toLowerCase()
                .includes((matchSearches[key] || "").toLowerCase())
            );

            return (
              <div
                key={key}
                className="bg-slate-700/50 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleCompetition(key)}
                  className="w-full flex justify-between items-center p-3 text-left font-bold text-slate-200 hover:bg-slate-600/50"
                >
                  <span>{name}</span>
                  <span
                    className={`transform transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {isExpanded && (
                  <div className="p-2 bg-slate-900/50 animate-fade-in">
                    <div className="relative my-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        placeholder={`Search matches in ${name}...`}
                        value={matchSearches[key] || ""}
                        onChange={(e) =>
                          handleMatchSearchChange(key, e.target.value)
                        }
                        className="w-full bg-slate-700 border-2 border-slate-600 rounded-lg p-2 pl-10 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
                      {filteredMatches.map((game) => {
                        const isSelected = selectedGames.some(
                          (g) => g.id === game.id
                        );
                        return (
                          <button
                            key={game.id}
                            onClick={() => handleSelectGame(game)}
                            disabled={!isSelected && selectedGames.length >= 3}
                            className={`w-full flex items-center p-2 rounded-lg text-left transition-all duration-200 ${
                              isSelected
                                ? "bg-green-500 text-white cursor-pointer"
                                : "text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                          >
                            <img
                              src={game.home.logo}
                              alt={game.home.name}
                              className="w-auto h-5 mr-2"
                            />
                            <span className="font-semibold flex-1 text-sm">
                              {game.home.name} vs {game.away.name}
                            </span>
                            <img
                              src={game.away.logo}
                              alt={game.away.name}
                              className="w-auto h-5 ml-2"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bet Slip */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${
          selectedGames.length > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            isSlipOpen ? "bg-slate-800/80 backdrop-blur-sm" : ""
          }`}
        >
          <div
            className={`bg-slate-800 shadow-2xl rounded-t-2xl max-w-4xl mx-auto border-t-2 border-x-2 border-slate-600`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => setIsSlipOpen(!isSlipOpen)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    {selectedGames.length}
                  </span>
                  <h2 className="text-xl font-bold text-slate-100">
                    {isSlipOpen ? "Your Bet Slip" : "View Bet Slip"}
                  </h2>
                </div>
                <ChevronUpIcon
                  className={`w-auto h-6 text-white transition-transform ${
                    isSlipOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {isSlipOpen && (
              <div className="p-4 border-t-2 border-slate-700 animate-fade-in">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-slate-100">
                    Your 3 Games
                  </h2>
                  {selectedGames.length > 0 && (
                    <button
                      onClick={clearSlip}
                      className="text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" /> Clear Slip
                    </button>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  {[0, 1, 2].map((index) => {
                    const game = selectedGames[index];
                    return game ? (
                      <div
                        key={game.id}
                        className="bg-slate-700 border border-slate-600 text-slate-100 p-2 rounded-lg flex items-center gap-2 text-sm animate-fade-in-up"
                      >
                        <img
                          src={game.home.logo}
                          alt={game.home.name}
                          className="w-auto h-6"
                        />
                        <span className="font-semibold">
                          {game.home.name} v {game.away.name}
                        </span>
                        <img
                          src={game.away.logo}
                          alt={game.away.name}
                          className="w-auto h-6"
                        />
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="bg-slate-700/50 h-10 p-2 rounded-lg text-center text-slate-400 text-xs flex items-center justify-center"
                      >
                        Empty Slot
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 mb-3">
                    Set Your Stake
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        $
                      </span>
                      <input
                        type="number"
                        value={stake}
                        onChange={handleStakeChange}
                        className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-lg p-3 pl-7 text-lg font-bold text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      {quickStakeAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setStake(amount)}
                          className="bg-slate-600 text-slate-200 font-bold py-3 px-4 rounded-lg hover:bg-slate-500 transition-colors"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => onStartGame(selectedGames, stake)}
                    disabled={!isReady}
                    className={`w-full text-white text-lg font-bold py-4 rounded-xl shadow-lg transition-all duration-300 ${
                      isReady
                        ? "bg-green-600 hover:bg-green-500 animate-pulse-green"
                        : "bg-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isReady
                      ? `Place Bet: $${stake.toFixed(2)}`
                      : "Select 3 Games"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const BettingGrid = ({
  games,
  scores,
  gridState,
  completedLines,
  stake,
  gameTimes,
  boost,
}: {
  games: Game[];
  scores: { [key: string]: Score };
  gridState: boolean[][];
  completedLines: CompletedLines;
  stake: number;
  gameTimes: { [key: string]: number };
  boost: { teamId: string; gameId: string; amount: number } | null;
}) => {
  return (
    <div
      className="p-1.5 bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-600"
      style={{ "--shine-angle": "15deg" } as CSSProperties}
    >
      <div className="grid grid-cols-[2fr_repeat(6,1fr)]">
        {/* Header Row */}
        <div className="p-3 font-bold text-slate-300 text-xs uppercase tracking-wider">
          Game
        </div>
        {GOAL_THRESHOLDS.map((t) => (
          <div key={t.value} className="text-center p-3">
            <p className="font-extrabold text-white text-lg">{t.value}+</p>
          </div>
        ))}
        <div className="text-center p-3 font-bold text-slate-300 text-xs uppercase tracking-wider"></div>

        {/* Game Rows */}
        {games.map((game, rowIndex) => {
          const gameScore = scores[game.id] || { home: 0, away: 0 };
          const isRowComplete = completedLines.rows.includes(rowIndex);
          const isHomeBoosted =
            boost?.gameId === game.id && boost?.teamId === game.home.id;
          const isAwayBoosted =
            boost?.gameId === game.id && boost?.teamId === game.away.id;

          return (
            <React.Fragment key={game.id}>
              <div
                className={`p-3 border-t border-white/10 relative ${
                  isRowComplete ? "row-win-bg static-shine" : ""
                }`}
              >
                {gameTimes[game.id] > 0 && (
                  <span className="absolute top-1 right-2 text-xs font-bold text-red-500 animate-pulse-red">
                    {gameTimes[game.id]}’
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <p className="font-bold text-base text-white">
                    {game.home.name} vs {game.away.name}
                  </p>
                </div>

                <p
                  className={`text-xl font-bold transition-colors duration-300 ${
                    isHomeBoosted
                      ? "text-yellow-400 animate-pulse"
                      : "text-blue-300"
                  }`}
                >
                  {gameScore.home} -{" "}
                  <span
                    className={`${
                      isAwayBoosted
                        ? "text-yellow-400 animate-pulse"
                        : "text-blue-300"
                    }`}
                  >
                    {gameScore.away}
                  </span>
                </p>
              </div>
              {GOAL_THRESHOLDS.map((_, colIndex) => {
                const isColComplete = completedLines.cols.includes(colIndex);
                const isFilled = gridState[rowIndex]?.[colIndex];
                let cellClass = "cell-empty";
                if (isRowComplete && isColComplete)
                  cellClass = "cell-win-intersect";
                else if (isRowComplete || isColComplete) cellClass = "cell-win";
                else if (isFilled) cellClass = "cell-filled";
                return (
                  <div
                    key={colIndex}
                    className={`border-t border-l border-white/10 relative`}
                  >
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${cellClass} ${
                        isRowComplete || isColComplete ? "static-shine" : ""
                      }`}
                    ></div>
                    {isFilled && (
                      <div className="absolute inset-0 flex items-center justify-center animate-cell-icon-in">
                        <div className="w-8 h-8">
                          <FootballIcon />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div
                className={`p-1.5 border-t border-l border-white/10 flex items-center justify-center ${
                  isRowComplete ? "row-win-bg static-shine" : ""
                }`}
              >
                <p
                  className={`font-bold text-lg text-yellow-300 ${
                    boost?.gameId === game.id ? "animate-pulse" : ""
                  }`}
                >
                  $
                  {(
                    ROW_PRIZE_MULTIPLIER * stake +
                    (boost?.gameId === game.id ? boost.amount * 2 : 0)
                  ).toFixed(2)}
                </p>
              </div>
            </React.Fragment>
          );
        })}

        {/* Footer Payout Row */}
        <div className="p-3 border-t-2 border-white/20 font-bold text-slate-300 text-xs uppercase tracking-wider"></div>
        {GOAL_THRESHOLDS.map((t, colIndex) => {
          const isColComplete = completedLines.cols.includes(colIndex);
          return (
            <div
              key={t.value}
              className={`text-center p-3 border-t-2 border-l border-white/20 ${
                isColComplete ? "cell-win static-shine" : ""
              }`}
            >
              <p
                className={`font-bold text-lg ${
                  isColComplete ? "text-yellow-300" : "text-green-400"
                } ${boost ? "text-yellow-400 animate-pulse" : ""}`}
              >
                $
                {(
                  t.multiplier * stake +
                  (boost ? boost.amount * 2 : 0)
                ).toFixed(2)}
              </p>
            </div>
          );
        })}
        <div className="border-t-2 border-l border-white/20"></div>
      </div>
    </div>
  );
};

const PowerUpControls = ({
  boostAvailable,
  boost,
  games,
  onSelectBoostTeam,
  isBoosting,
  onConfirmBoost,
  onCancelBoost,
}: {
  boostAvailable: boolean;
  boost: {
    teamId: string;
    gameId: string;
    expiry: number;
    amount: number;
  } | null;
  games: Game[];
  onSelectBoostTeam: (teamId: string, gameId: string) => void;
  isBoosting: { teamId: string; gameId: string } | null;
  onConfirmBoost: (amount: number) => void;
  onCancelBoost: () => void;
}) => {
  const [boostAmount, setBoostAmount] = useState(10);

  if (isBoosting) {
    const team = games
      .flatMap((g) => [g.home, g.away])
      .find((t) => t.id === isBoosting.teamId);
    if (!team) return null;
    return (
      <div className="power-up-box available">
        <h3 className="power-up-title">
          ⚡️ BOOST {team.name.toUpperCase()} ⚡️
        </h3>
        <p className="power-up-desc">
          Chip in extra to double it and add to the prize pool!
        </p>
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
          <div className="relative flex-grow w-full sm:w-auto">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              $
            </span>
            <input
              type="number"
              value={boostAmount}
              onChange={(e) =>
                setBoostAmount(Math.max(1, parseInt(e.target.value, 10) || 0))
              }
              className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg p-3 pl-7 text-lg font-bold text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
          <button
            onClick={() => onConfirmBoost(boostAmount)}
            className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-500 transition-colors"
          >
            Confirm Boost
          </button>
          <button
            onClick={onCancelBoost}
            className="w-full sm:w-auto bg-slate-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (boost) {
    const boostedTeam = games
      .flatMap((g) => [g.home, g.away])
      .find((t) => t.id === boost.teamId);
    return (
      <div className="power-up-box used">
        <h3 className="power-up-title">⚡️ BOOST ACTIVE ⚡️</h3>
        {boostedTeam && (
          <p className="power-up-desc">
            {boostedTeam.name} boosted with ${boost.amount.toFixed(2)} until{" "}
            {boost.expiry}'!
          </p>
        )}
      </div>
    );
  }

  if (boostAvailable) {
    const allTeams = games.flatMap((g) => [
      { ...g.home, gameId: g.id },
      { ...g.away, gameId: g.id },
    ]);
    const uniqueTeams = allTeams.filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i
    );

    return (
      <div className="power-up-box available">
        <div className="power-up-flare"></div>
        <h3 className="power-up-title">⚡️ POWER-UP READY ⚡️</h3>
        <p className="power-up-desc">
          Chip in extra cash to double it and add it to the row and column
          prizes!
        </p>
        <div className="power-up-teams">
          {uniqueTeams.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelectBoostTeam(team.id, team.gameId)}
              className="power-up-team-button"
            >
              <img src={team.logo} alt={team.name} className="w-10 h-10" />
              <span className="power-up-team-name">{team.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!boostAvailable && !boost) {
    return (
      <div className="power-up-box used">
        <h3 className="power-up-title">BOOST USED</h3>
        <p className="power-up-desc">
          Your one-time boost for this game has been used.
        </p>
      </div>
    );
  }

  return null;
};

const WinningsDisplay = ({
  totalWinnings,
  stake,
  boostStake,
}: {
  totalWinnings: number;
  stake: number;
  boostStake: number;
}) => {
  const totalStake = stake + boostStake;
  const profit = totalWinnings - totalStake;
  return (
    <div className="my-4 p-4 bg-slate-800 rounded-xl shadow-lg border-2 border-slate-600 text-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        Winnings
      </h3>
      <p className="text-4xl font-extrabold text-green-400 my-1">
        ${totalWinnings.toFixed(2)}
      </p>
      <p className="text-xs text-slate-500">
        Total Stake: ${totalStake.toFixed(2)} / Profit:
        <span
          className={`font-bold ${
            profit >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {" "}
          ${profit.toFixed(2)}
        </span>
      </p>
    </div>
  );
};

const Jackpot = ({ amount }: { amount: number }) => {
  const [displayAmount, setDisplayAmount] = useState(amount);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setDisplayAmount((currentAmount) => {
        const difference = amount - currentAmount;
        if (Math.abs(difference) < 1) {
          cancelAnimationFrame(animationFrameId);
          return amount;
        }
        const step = difference * 0.1;
        return currentAmount + step;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [amount]);

  const formattedAmount = Math.round(displayAmount).toLocaleString("en-US");

  return (
    <div className="jackpot-box my-4">
      <div className="jackpot-flare"></div>
      <div className="jackpot-content">
        <div className="jackpot-title">
          <span className="jackpot-crown">👑</span>
          <span>JACKPOT</span>
        </div>
        <div className="jackpot-amount">
          <span className="jackpot-currency">$</span>
          {formattedAmount.split("").map((char, index) =>
            char === "," ? (
              <span key={index} className="jackpot-comma">
                ,
              </span>
            ) : (
              <div key={index} className="jackpot-digit-box">
                {char}
              </div>
            )
          )}
        </div>
        <div className="jackpot-footer">CLEAR THE BOARD TO WIN THE JACKPOT</div>
      </div>
    </div>
  );
};

const LiveEventTicker = ({ events }: { events: LiveEvent[] }) => (
  <div className="bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-600 p-4 my-4">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-lg font-bold text-slate-300">Live Event Ticker</h2>
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        <span className="text-sm font-semibold text-red-400">LIVE</span>
      </div>
    </div>
    <div className="space-y-3 h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700">
      {events.length === 0 ? (
        <p className="text-center text-slate-400 pt-8">
          Click "Simulate Event"...
        </p>
      ) : (
        events
          .slice()
          .reverse()
          .map((event) => (
            <div
              key={event.id}
              className="flex items-center animate-fade-in-up"
            >
              <EventTickerIcon type={event.type} />
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-200">
                  {event.text}
                </p>
                <p className="text-xs text-slate-400">{event.game}</p>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {event.minute}'
              </span>
            </div>
          ))
      )}
    </div>
  </div>
);

// --- MAIN APP ---
export default function App() {
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [stake, setStake] = useState(10);
  const [boostStake, setBoostStake] = useState(0);
  const [liveScores, setLiveScores] = useState<{ [key: string]: Score }>({});
  const [gameTimes, setGameTimes] = useState<{ [key: string]: number }>({});
  const [jackpot, setJackpot] = useState(300000);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [winnings, setWinnings] = useState<Winnings[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);
  const [completedLines, setCompletedLines] = useState<CompletedLines>({
    rows: [],
    cols: [],
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [boost, setBoost] = useState<{
    teamId: string;
    gameId: string;
    expiry: number;
    amount: number;
  } | null>(null);
  const [boostAvailable, setBoostAvailable] = useState(true);
  const [isBoosting, setIsBoosting] = useState<{
    teamId: string;
    gameId: string;
  } | null>(null);

  const goalAudioRef = useRef<HTMLAudioElement | null>(null);
  const jackpotAudioRef = useRef<HTMLAudioElement | null>(null);
  const winnerAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    document.title = "Bet Ladder";
    goalAudioRef.current = new Audio("/bet-365-goal-sound.mp3");
    goalAudioRef.current.load();
    jackpotAudioRef.current = new Audio("/jackpot.mp3");
    jackpotAudioRef.current.load();
    winnerAudioRef.current = new Audio("/winner.mp3");
    winnerAudioRef.current.load();
  }, []);

  const totalWinnings = useMemo(
    () => winnings.reduce((acc, win) => acc + win.amount, 0),
    [winnings]
  );
  const gridState: boolean[][] = useMemo(
    () =>
      isGameStarted
        ? selectedGames.map((game) =>
            GOAL_THRESHOLDS.map(
              (threshold) =>
                (liveScores[game.id]?.home || 0) +
                  (liveScores[game.id]?.away || 0) >=
                threshold.value
            )
          )
        : [],
    [liveScores, selectedGames, isGameStarted]
  );

  const runSimulation = useCallback(() => {
    if (celebration) return;
    const gameIndex = Math.floor(Math.random() * selectedGames.length);
    const game = selectedGames[gameIndex];
    if (!game) return;

    const currentMinute = gameTimes[game.id] || 0;
    if (currentMinute >= 90) return; // End game at 90 mins
    const newMinute = Math.min(
      90,
      currentMinute + Math.floor(Math.random() * 5) + 1
    );
    setGameTimes((prev) => ({ ...prev, [game.id]: newMinute }));

    if (boost && game.id === boost.gameId && newMinute > boost.expiry) {
      setBoost(null);
    }

    const teamToAct = Math.random() < 0.5 ? game.home : game.away;
    const player =
      teamToAct.players[Math.floor(Math.random() * teamToAct.players.length)];
    const eventRoll = Math.random();
    let eventData: Omit<LiveEvent, "id">;

    let goalThreshold = 0.6; // 40% chance of goal
    const isBoosted =
      boost && game.id === boost.gameId && teamToAct.id === boost.teamId;
    if (isBoosted) goalThreshold = 0.2; // 80% chance of goal

    if (eventRoll > goalThreshold) {
      eventData = {
        type: "GOAL",
        text: `${player} scores for ${teamToAct.name}! ${
          isBoosted ? " (BOOSTED!)" : ""
        }`,
        game: `${game.home.name} vs ${game.away.name}`,
        minute: newMinute,
      };
      if (goalAudioRef.current) {
        goalAudioRef.current.play().catch(console.error);
      }
      setCelebration({ type: "GOAL", text: eventData.text });
      setLiveScores((prev) => {
        const newScores = JSON.parse(JSON.stringify(prev));
        newScores[game.id][
          teamToAct.id === game.home.id ? "home" : "away"
        ] += 1;
        return newScores;
      });
    } else if (eventRoll > 0.3) {
      eventData = {
        type: "CHANCE",
        text: `${player} has a shot, but it's just wide!`,
        game: `${game.home.name} vs ${game.away.name}`,
        minute: newMinute,
      };
    } else {
      eventData = {
        type: "SAVE",
        text: `Great save! ${player}'s shot is denied.`,
        game: `${game.home.name} vs ${game.away.name}`,
        minute: newMinute,
      };
    }
    setEvents((prev) => [...prev, { ...eventData, id: Date.now() }]);
  }, [selectedGames, celebration, liveScores, gameTimes, boost]);

  useEffect(() => {
    if (!isGameStarted || !isSimulating) return;

    const simInterval = setInterval(runSimulation, 2000 / simSpeed);
    const jackpotInterval = setInterval(() => {
      setJackpot((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 2000 / simSpeed);

    return () => {
      clearInterval(simInterval);
      clearInterval(jackpotInterval);
    };
  }, [isGameStarted, isSimulating, runSimulation, simSpeed]);

  useEffect(() => {
    if (!isGameStarted || celebration) return;
    const existingWinIds = new Set(winnings.map((w) => w.id));

    if (
      gridState.length > 0 &&
      gridState.every((row) => row.every((cell) => cell))
    ) {
      if (!existingWinIds.has("jackpot")) {
        const jackpotAmount = jackpot;
        if (jackpotAudioRef.current) {
          jackpotAudioRef.current.play().catch(console.error);
        }
        setWinnings((prev) => [
          ...prev,
          { id: "jackpot", amount: jackpotAmount },
        ]);
        setCelebration({ type: "JACKPOT", amount: jackpotAmount });
        setIsSimulating(false);
      }
      return;
    }

    const newWinnings: Winnings[] = [];
    const newCompleted = {
      rows: [...completedLines.rows],
      cols: [...completedLines.cols],
    };
    let newCelebration: CelebrationState | null = null;

    gridState.forEach((row, rowIndex) => {
      if (
        row.every((cell) => cell) &&
        !completedLines.rows.includes(rowIndex)
      ) {
        const winAmount =
          ROW_PRIZE_MULTIPLIER * stake +
          (boost && boost.gameId === selectedGames[rowIndex].id
            ? boost.amount * 2
            : 0);
        newWinnings.push({ id: `row-${rowIndex}`, amount: winAmount });
        newCompleted.rows.push(rowIndex);
        newCelebration = {
          type: "ROW_WIN",
          text: `Row ${rowIndex + 1} Cleared!`,
          amount: winAmount,
        };
      }
    });

    for (let colIndex = 0; colIndex < GOAL_THRESHOLDS.length; colIndex++) {
      if (
        gridState.length > 0 &&
        gridState.every((row) => row[colIndex]) &&
        !completedLines.cols.includes(colIndex)
      ) {
        const winAmount =
          GOAL_THRESHOLDS[colIndex].multiplier * stake +
          (boost ? boost.amount * 2 : 0);
        newWinnings.push({ id: `col-${colIndex}`, amount: winAmount });
        newCompleted.cols.push(colIndex);
        newCelebration = {
          type: "COLUMN_WIN",
          text: `${GOAL_THRESHOLDS[colIndex].value}+ Goals Column Cleared!`,
          amount: winAmount,
        };
      }
    }
    if (newWinnings.length > 0) {
      if (winnerAudioRef.current) {
        winnerAudioRef.current.play().catch(console.error);
      }
      setWinnings((prev) => [...prev, ...newWinnings]);
      setCompletedLines(newCompleted);
      if (newCelebration && !celebration) {
        setCelebration(newCelebration);
      }
    }
  }, [
    gridState,
    isGameStarted,
    jackpot,
    winnings,
    celebration,
    completedLines,
    stake,
  ]);

  const handleStartGame = (games: Game[], gameStake: number) => {
    if (games.length === 3 && gameStake > 0) {
      const initialScores: { [key: string]: Score } = {};
      const initialTimes: { [key: string]: number } = {};
      games.forEach((g) => {
        initialScores[g.id] = { home: 0, away: 0 };
        initialTimes[g.id] = 0;
      });
      setSelectedGames(games);
      setStake(gameStake);
      setLiveScores(initialScores);
      setGameTimes(initialTimes);
      setIsGameStarted(true);
      setWinnings([]);
      setEvents([]);
      setCelebration(null);
      setCompletedLines({ rows: [], cols: [] });
      setIsSimulating(true);
      setBoost(null);
      setBoostAvailable(true);
      setBoostStake(0);
      setIsBoosting(null);
    }
  };

  const handleSelectBoostTeam = (teamId: string, gameId: string) => {
    if (!boostAvailable) return;
    setIsBoosting({ teamId, gameId });
  };

  const handleCancelBoost = () => {
    setIsBoosting(null);
  };

  const handleConfirmBoost = (amount: number) => {
    if (!isBoosting || amount <= 0) return;

    const { teamId, gameId } = isBoosting;
    const currentMinute = gameTimes[gameId] || 0;

    setBoost({
      teamId: teamId,
      gameId,
      expiry: currentMinute + 15,
      amount: amount,
    });
    setBoostStake(amount);
    setBoostAvailable(false);
    setIsBoosting(null);
  };

  const handleReset = () => {
    setIsGameStarted(false);
    setCelebration(null);
    setIsSimulating(false);
  };
  const handleAnimationEnd = useCallback(() => {
    setCelebration(null);
  }, []);

  return (
    <div className="bg-[#0a192f] min-h-screen font-sans">
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes celebration-zoom { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes cell-icon-in { 0% { transform: scale(2); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .confetti { position: absolute; top: -20px; width: 10px; height: 10px; animation: fall 3s linear infinite; }
        @keyframes fall { to { transform: translateY(100vh) rotate(360deg); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out forwards; }
        .animate-celebration-zoom { animation: celebration-zoom 0.5s ease-out forwards; }
        .animate-cell-icon-in { animation: cell-icon-in 0.4s ease-out; }
        .cell-empty { background-color: rgba(10,20,40,0.5); box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .cell-filled { background-color: #059669; }
        .cell-win { background-color: #b45309; }
        .cell-win-intersect { background-color: #d97706; }
        .row-win-bg { background-color: rgba(124, 45, 18, 0.2); }
        .static-shine { background-image: linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.15) 50%, transparent 75%); }
        .scrollbar-thin::-webkit-scrollbar { width: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
        
        @keyframes pulse-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); } 50% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); } }
        .animate-pulse-green { animation: pulse-green 2s infinite; }
        @keyframes pulse-red { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        .animate-pulse-red { animation: pulse-red 1.5s infinite; }

        .jackpot-box {
            background: #1f2937;
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
            position: relative;
            border: 1px solid #4b5563;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.4);
            overflow: hidden;
        }
        .jackpot-title {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.125rem;
            font-weight: 700;
            color: #fcd34d;
            text-transform: uppercase;
            letter-spacing: 0.15em;
        }
        .jackpot-crown { font-size: 0.9em; }
        .jackpot-amount {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.75rem;
            margin-bottom: 0.75rem;
        }
        .jackpot-digit-box {
            background-color: #111827;
            color: #f3f4f6;
            font-family: 'Courier New', Courier, monospace;
            font-size: 3rem;
            font-weight: 700;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            border-bottom: 2px solid #374155;
            min-width: 40px;
        }
        .jackpot-currency {
            font-family: 'Courier New', Courier, monospace;
            font-size: 2.5rem;
            font-weight: 700;
            color: #16a34a;
            padding-right: 0.5rem;
            text-shadow: 0 0 8px rgba(74, 222, 128, 0.7);
        }
        .jackpot-comma {
            font-family: 'Courier New', Courier, monospace;
            font-size: 2.5rem;
            font-weight: 700;
            color: #d1d5db;
            padding: 0 0.1rem;
        }
        .jackpot-footer {
            font-size: 0.875rem;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        @keyframes lens-flare {
            0% { transform: translateX(-100%) skewX(-30deg); opacity: 0; }
            5% { transform: translateX(-100%) skewX(-30deg); opacity: 0.5; }
            95% { transform: translateX(100%) skewX(-30deg); opacity: 0.5; }
            100% { transform: translateX(100%) skewX(-30deg); opacity: 0; }
        }
        .jackpot-flare {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent);
            animation: lens-flare 5s infinite;
        }

        .power-up-box {
            background: #1f2937;
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
            position: relative;
            border: 1px solid #4b5563;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(0,0,0,0.4);
            overflow: hidden;
            margin-top: 1rem;
        }
        .power-up-box.used {
            background: #374151;
            border-color: #6b7280;
        }
        .power-up-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #fcd34d;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        .power-up-box.used .power-up-title {
            color: #9ca3af;
        }
        .power-up-desc {
            color: #d1d5db;
            margin-bottom: 1rem;
        }
        .power-up-teams {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
            gap: 0.75rem;
        }
        .power-up-team-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
            background: rgba(255,255,255,0.05);
            border-radius: 0.5rem;
            border: 1px solid #4b5563;
            transition: all 0.2s ease-in-out;
            color: #f3f4f6;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .power-up-team-button:hover {
            transform: translateY(-2px);
            background: rgba(255,255,255,0.1);
            border-color: #fcd34d;
        }
        .power-up-team-name {
            font-size: 0.75rem;
            font-weight: 600;
            color: #f3f4f6;
        }
        .power-up-flare {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(252, 211, 77, 0.1), transparent);
            animation: lens-flare 5s infinite;
        }
      `}</style>
      <Header />
      <main className="p-4 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-100">
            Bet Ladder
          </h1>
        </div>
        {celebration && (
          <CelebrationOverlay
            type={celebration.type}
            text={celebration.text}
            amount={celebration.amount}
            onAnimationEnd={handleAnimationEnd}
          />
        )}

        {!isGameStarted ? (
          <GameSetup onStartGame={handleStartGame} />
        ) : (
          <div className="relative z-10">
            <Jackpot amount={jackpot} />
            {isGameStarted && (
              <WinningsDisplay
                totalWinnings={totalWinnings}
                stake={stake}
                boostStake={boostStake}
              />
            )}
            <BettingGrid
              games={selectedGames}
              stake={stake}
              scores={liveScores}
              gridState={gridState}
              completedLines={completedLines}
              gameTimes={gameTimes}
              boost={boost}
            />
            <PowerUpControls
              games={selectedGames}
              boostAvailable={boostAvailable}
              boost={boost}
              onSelectBoostTeam={handleSelectBoostTeam}
              isBoosting={isBoosting}
              onConfirmBoost={handleConfirmBoost}
              onCancelBoost={handleCancelBoost}
            />
            <LiveEventTicker events={events} />
            <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {isSimulating ? <PauseIcon /> : <PlayIcon />}
                  {isSimulating ? "Pause" : "Play"}
                </button>
                <button
                  onClick={() => setSimSpeed((s) => (s === 4 ? 1 : s * 2))}
                  disabled={!isSimulating}
                  className={`bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-purple-700 transition-colors flex items-center gap-2 ${
                    !isSimulating ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FastForwardIcon />
                  {simSpeed}x
                </button>
              </div>
              <button
                onClick={handleReset}
                className="bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <ResetIcon />
                Reset
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
