// Sports categories and lists for the Kala Kaushal platform

export const SPORTS_CATEGORIES = {
  TEAM_SPORTS: 'Team Sports',
  INDIVIDUAL_SPORTS: 'Individual Sports',
  COMBAT_SPORTS: 'Combat Sports',
  WATER_SPORTS: 'Water Sports',
  ATHLETIC_EVENTS: 'Athletic Events',
  RACQUET_SPORTS: 'Racquet Sports',
  WINTER_SPORTS: 'Winter Sports',
  EXTREME_SPORTS: 'Extreme Sports'
} as const;

export const SPORTS_LIST = [
  // Team Sports
  { name: 'Cricket', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏏' },
  { name: 'Football (Soccer)', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '⚽' },
  { name: 'Basketball', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏀' },
  { name: 'Volleyball', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏐' },
  { name: 'Kabaddi', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🤼' },
  { name: 'Hockey', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏑' },
  { name: 'Rugby', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏈' },
  { name: 'Handball', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🤾' },
  { name: 'Baseball', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '⚾' },
  { name: 'American Football', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏈' },

  // Individual Sports
  { name: 'Athletics (Track & Field)', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🏃' },
  { name: 'Swimming', category: SPORTS_CATEGORIES.WATER_SPORTS, emoji: '🏊' },
  { name: 'Gymnastics', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🤸' },
  { name: 'Weightlifting', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🏋️' },
  { name: 'Cycling', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🚴' },
  { name: 'Running (Marathon)', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Wrestling', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🤼' },
  { name: 'Boxing', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥊' },
  { name: 'Archery', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🏹' },
  { name: 'Shooting', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🏆' },

  // Racquet Sports
  { name: 'Tennis', category: SPORTS_CATEGORIES.RACQUET_SPORTS, emoji: '🎾' },
  { name: 'Badminton', category: SPORTS_CATEGORIES.RACQUET_SPORTS, emoji: '🏸' },
  { name: 'Table Tennis', category: SPORTS_CATEGORIES.RACQUET_SPORTS, emoji: '🏓' },
  { name: 'Squash', category: SPORTS_CATEGORIES.RACQUET_SPORTS, emoji: '🎾' },

  // Combat Sports
  { name: 'Judo', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥋' },
  { name: 'Karate', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥋' },
  { name: 'Taekwondo', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥋' },
  { name: 'Mixed Martial Arts (MMA)', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥊' },
  { name: 'Kung Fu', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥋' },

  // Water Sports
  { name: 'Water Polo', category: SPORTS_CATEGORIES.WATER_SPORTS, emoji: '🤽' },
  { name: 'Diving', category: SPORTS_CATEGORIES.WATER_SPORTS, emoji: '🏊' },
  { name: 'Surfing', category: SPORTS_CATEGORIES.WATER_SPORTS, emoji: '🏄' },
  { name: 'Sailing', category: SPORTS_CATEGORIES.WATER_SPORTS, emoji: '⛵' },
  { name: 'Rowing', category: SPORTS_CATEGORIES.WATER_SPORTS, emoji: '🚣' },

  // Athletic Events
  { name: 'Sprinting (100m, 200m, 400m)', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Long Distance Running', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'High Jump', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Long Jump', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Pole Vault', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Shot Put', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Discus Throw', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Javelin Throw', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Hammer Throw', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Decathlon', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },
  { name: 'Heptathlon', category: SPORTS_CATEGORIES.ATHLETIC_EVENTS, emoji: '🏃' },

  // Traditional Indian Sports
  { name: 'Kho Kho', category: SPORTS_CATEGORIES.TEAM_SPORTS, emoji: '🏃' },
  { name: 'Mallakhamb', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🤸' },
  { name: 'Pehlwani (Indian Wrestling)', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🤼' },
  { name: 'Gatka', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '⚔️' },
  { name: 'Kalaripayattu', category: SPORTS_CATEGORIES.COMBAT_SPORTS, emoji: '🥋' },

  // Winter Sports (for completeness)
  { name: 'Skiing', category: SPORTS_CATEGORIES.WINTER_SPORTS, emoji: '⛷️' },
  { name: 'Ice Hockey', category: SPORTS_CATEGORIES.WINTER_SPORTS, emoji: '🏒' },
  { name: 'Figure Skating', category: SPORTS_CATEGORIES.WINTER_SPORTS, emoji: '⛸️' },
  { name: 'Snowboarding', category: SPORTS_CATEGORIES.WINTER_SPORTS, emoji: '🏂' },

  // Extreme/Adventure Sports
  { name: 'Rock Climbing', category: SPORTS_CATEGORIES.EXTREME_SPORTS, emoji: '🧗' },
  { name: 'Paragliding', category: SPORTS_CATEGORIES.EXTREME_SPORTS, emoji: '🪂' },
  { name: 'Skateboarding', category: SPORTS_CATEGORIES.EXTREME_SPORTS, emoji: '🛹' },
  { name: 'BMX', category: SPORTS_CATEGORIES.EXTREME_SPORTS, emoji: '🚴' },

  // Motor Sports
  { name: 'Motor Racing', category: SPORTS_CATEGORIES.EXTREME_SPORTS, emoji: '🏎️' },
  { name: 'Motorcycle Racing', category: SPORTS_CATEGORIES.EXTREME_SPORTS, emoji: '🏍️' },

  // Equestrian
  { name: 'Equestrian', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🏇' },

  // Golf
  { name: 'Golf', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '⛳' },

  // Yoga/Fitness
  { name: 'Yoga', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🧘' },
  { name: 'Bodybuilding', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '💪' },
  { name: 'Powerlifting', category: SPORTS_CATEGORIES.INDIVIDUAL_SPORTS, emoji: '🏋️' },
] as const;

// Helper functions
export const getSportsByCategory = (category: string) => {
  return SPORTS_LIST.filter(sport => sport.category === category);
};

export const getAllSportNames = () => {
  return SPORTS_LIST.map(sport => sport.name);
};

export const getSportEmoji = (sportName: string) => {
  const sport = SPORTS_LIST.find(s => s.name === sportName);
  return sport?.emoji || '🏆';
};

export const getSportCategory = (sportName: string) => {
  const sport = SPORTS_LIST.find(s => s.name === sportName);
  return sport?.category || SPORTS_CATEGORIES.INDIVIDUAL_SPORTS;
};