export class MapType {
  [key: string]: { name: string; imageUrl: string; emoji: string; omitFromMapvote?: boolean };
}

export const mapRegistry: MapType = {
  CT: {
    name: 'Carentan',
    emoji: '🏙️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/carentan.webp',
  },
  Foy: {
    name: 'Foy',
    emoji: '☃️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/foy.webp',
  },
  Hill400: {
    name: 'Hill 400',
    emoji: '⛰️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/hill400.webp',
  },
  Hurtgen: {
    name: 'Hurtgen Forest',
    emoji: '🌲',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/hurtgen.webp',
  },
  Omaha: {
    name: 'Omaha Beach',
    emoji: '🏘️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/omaha.webp',
    omitFromMapvote: true,
  },
  PHL: {
    name: 'Purple Heart Lane',
    emoji: '💜',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/phl.webp',
  },
  SME: {
    name: 'Sainte-Mère-Église',
    emoji: '🏘️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/sme.webp',
  },
  StMarie: {
    name: 'Sainte-Marie-du-Mont',
    emoji: '⛪',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/smdm.webp',
  },
  Utah: {
    name: 'Utah Beach',
    emoji: '⛱️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/utah.webp',
  },
  Kursk: {
    name: 'Kursk',
    emoji: '🇷🇺',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/kursk.webp',
  },
  Stalin: {
    name: 'Stalingrad',
    emoji: '🏚️',
    imageUrl:
      'https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/stalingrad.webp',
  },
};
