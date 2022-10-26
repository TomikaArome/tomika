export interface Splatoon2Battle {
  battle_number: string;
  elapsed_time: number;
  estimate_gachi_power: number;
  game_mode: Splatoon2BattleResult;
  league_point: number;
  max_league_point: number;
  my_estimate_league_point: number;
  my_team_count: number;
  my_team_result: Splatoon2BattleResult;
  other_estimate_league_point: number;
  other_team_count: number;
  other_team_result: Splatoon2BattleResult;
  player_rank: number;
  player_result: Splatoon2PlayerResult;
  rule: Splatoon2Mode;
  stage: Splatoon2Stage;
  star_rank: number;
  start_time: number;
  tag_id: string;
  type: string;
  udemae: Splatoon2Rank;
  weapon_paint_point: number;
}

export interface Splatoon2BattleResult {
  key: string;
  name: string;
}

export interface Splatoon2Brand {
  frequent_skill: Splatoon2Skill;
  id: string;
  image: string;
  name: string;
}

export interface Splatoon2Skills {
  main: Splatoon2Skill;
  subs: Splatoon2Skill[];
}

export interface Splatoon2Skill {
  id: string;
  image: string;
  name: string;
}

export interface Splatoon2Gear {
  brand: Splatoon2Brand;
  id: string;
  image: string;
  kind: string;
  name: string;
  rarity: number;
  thumbnail: string;
}

export interface Splatoon2PlayerType {
  species: string;
  style: string;
}

export interface Splatoon2Rank {
  is_number_reached: boolean;
  is_x: true;
  name: string;
  number: number;
  s_plus_number: number | null;
}

export interface Splatoon2Weapon {
  id: string;
  image: string;
  name: string;
  special: Splatoon2Special;
  sub: Splatoon2Sub;
  thumbnail: string;
}

export interface Splatoon2Special {
  id: string;
  image_a: string;
  image_b: string;
  name: string;
}

export interface Splatoon2Sub {
  id: string;
  image_a: string;
  image_b: string;
  name: string;
}

export interface Splatoon2Player {
  clothes: Splatoon2Gear;
  clothes_skills: Splatoon2Skills;
  head: Splatoon2Gear;
  head_skills: Splatoon2Skills;
  nickname: string;
  player_rank: number;
  player_type: Splatoon2PlayerType;
  principle_id: string;
  shoes: Splatoon2Gear;
  shoes_skills: Splatoon2Skills;
  star_rank: number;
  udemae: Splatoon2Rank;
  weapon: Splatoon2Weapon;
}

export interface Splatoon2PlayerResult {
  assist_count: number;
  death_count: number;
  game_paint_point: number;
  kill_count: number;
  player: Splatoon2Player;
  sort_score: number;
  special_count: number;
}

export interface Splatoon2Mode {
  key: string;
  multiline_name: string;
  name: string;
}

export interface Splatoon2Stage {
  id: string;
  image: string;
  name: string;
}
