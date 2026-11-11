export interface PlanetData {
  name: string;
  color: string;
  size: number; // radius in pixels for display
  realDiameter: string; // km
  distanceFromSun: string; // million km
  orbitalPeriod: string; // Earth days/years
  orbitRadius: number; // pixels for display
  speed: number; // relative orbital speed
  description: string;
  moons: number;
  type: string;
}

export const planets: PlanetData[] = [
  {
    name: "Mercury",
    color: "#b5b5b5",
    size: 4,
    realDiameter: "4,879 km",
    distanceFromSun: "57.9 million km",
    orbitalPeriod: "88 days",
    orbitRadius: 60,
    speed: 4.15,
    description: "The smallest planet and closest to the Sun. It has no atmosphere and experiences extreme temperature swings.",
    moons: 0,
    type: "Terrestrial",
  },
  {
    name: "Venus",
    color: "#e8cda0",
    size: 7,
    realDiameter: "12,104 km",
    distanceFromSun: "108.2 million km",
    orbitalPeriod: "225 days",
    orbitRadius: 90,
    speed: 1.62,
    description: "Often called Earth's twin due to similar size. It has a thick, toxic atmosphere and is the hottest planet.",
    moons: 0,
    type: "Terrestrial",
  },
  {
    name: "Earth",
    color: "#4da6ff",
    size: 8,
    realDiameter: "12,756 km",
    distanceFromSun: "149.6 million km",
    orbitalPeriod: "365.25 days",
    orbitRadius: 125,
    speed: 1.0,
    description: "Our home planet! The only known planet with liquid water on its surface and the only one known to harbor life.",
    moons: 1,
    type: "Terrestrial",
  },
  {
    name: "Mars",
    color: "#e05a3a",
    size: 5,
    realDiameter: "6,792 km",
    distanceFromSun: "227.9 million km",
    orbitalPeriod: "687 days",
    orbitRadius: 165,
    speed: 0.53,
    description: "The Red Planet, named for its rusty color. It has the largest volcano and canyon in the solar system.",
    moons: 2,
    type: "Terrestrial",
  },
  {
    name: "Jupiter",
    color: "#c88b3a",
    size: 20,
    realDiameter: "142,984 km",
    distanceFromSun: "778.6 million km",
    orbitalPeriod: "11.86 years",
    orbitRadius: 220,
    speed: 0.084,
    description: "The largest planet in our solar system. Its Great Red Spot is a storm larger than Earth that has raged for centuries.",
    moons: 95,
    type: "Gas Giant",
  },
  {
    name: "Saturn",
    color: "#e8d5a3",
    size: 17,
    realDiameter: "120,536 km",
    distanceFromSun: "1,433.5 million km",
    orbitalPeriod: "29.46 years",
    orbitRadius: 280,
    speed: 0.034,
    description: "Famous for its stunning ring system made of ice and rock. It's the least dense planet — it could float in water!",
    moons: 146,
    type: "Gas Giant",
  },
  {
    name: "Uranus",
    color: "#7de8e8",
    size: 12,
    realDiameter: "51,118 km",
    distanceFromSun: "2,872.5 million km",
    orbitalPeriod: "84.01 years",
    orbitRadius: 340,
    speed: 0.012,
    description: "An ice giant that rotates on its side. It has a blue-green color from methane in its atmosphere.",
    moons: 28,
    type: "Ice Giant",
  },
  {
    name: "Neptune",
    color: "#3f54e8",
    size: 11,
    realDiameter: "49,528 km",
    distanceFromSun: "4,495.1 million km",
    orbitalPeriod: "164.8 years",
    orbitRadius: 390,
    speed: 0.006,
    description: "The windiest planet with speeds up to 2,100 km/h. It's the farthest planet from the Sun.",
    moons: 16,
    type: "Ice Giant",
  },
];
