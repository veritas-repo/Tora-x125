export const assets = [
  { symbol: "TORA-GB01", name: "Emerald Horizons Green Bond", type: "Green Bond", price: "$100.25", change: "+2.6%", volume: "$1.2M", liquidity: "$4.5M", yield: "6.5%", impact: "152,400 tCO₂e", icon: "♧" },
  { symbol: "TORA-SOLAR", name: "Sunrise Solar Farm", type: "Renewable Energy", price: "$1.24", change: "+4.6%", volume: "$2.8M", liquidity: "$6.1M", yield: "7.8%", impact: "98,200 tCO₂e", icon: "☀" },
  { symbol: "TORA-CARBON", name: "Borneo Forest Carbon Credits", type: "Carbon Removal", price: "$24.50", change: "+6.1%", volume: "$1.1M", liquidity: "$3.8M", yield: "—", impact: "77,850 tCO₂e", icon: "▲" },
  { symbol: "TORA-WATER", name: "AquaClean Water", type: "Water Infrastructure", price: "$0.98", change: "-1.2%", volume: "$620K", liquidity: "$2.4M", yield: "5.9%", impact: "125,000 people", icon: "♢" },
  { symbol: "TORA-WIND", name: "Tora Wind Project", type: "Wind Energy", price: "$1.67", change: "+3.9%", volume: "$1.0M", liquidity: "$3.2M", yield: "7.1%", impact: "41,200 tCO₂e", icon: "✣" }
];

export const portfolio = [
  ["Emerald Horizons Green Bond", "Green Bond", "$47,650.00", "+1.2%", "+12.4%", "152,400"],
  ["Sunrise Solar Farm", "Renewable Energy", "$42,580.00", "+0.8%", "+10.7%", "98,200"],
  ["Borneo Forest Credits", "Carbon Removal", "$27,640.00", "+1.6%", "+18.2%", "77,850"],
  ["AquaClean Water", "Water Infrastructure", "$7,550.00", "+0.4%", "+8.9%", "125,000"]
];

export const auditTrail = [
  ["Jun 24, 2024", "Project Created", "Project contract deployed"],
  ["Jun 25, 2024", "Verification Data Anchored", "Due diligence document hashes stored"],
  ["Jun 26, 2024", "Third-Party Audit Verified", "Audit report hash and signature recorded"],
  ["Jun 28, 2024", "Impact Data Updated", "MRV report anchored onchain"],
  ["Jul 01, 2024", "Tokens Minted", "125,000 TORA-CARBON issued"]
];
