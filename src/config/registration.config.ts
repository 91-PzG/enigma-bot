import { registerAs } from '@nestjs/config';

const roleReactions = {
  0: {
    normal: {
      emoji: '💂‍♂️',
      name: 'Fußsoldat',
    },
    squadlead: {
      emoji: '🤠',
      name: 'Offizier',
    },
  },
  1: {
    normal: {
      emoji: '💂‍♂️',
      name: 'Scharfschütze',
    },
    squadlead: {
      emoji: '🤠',
      name: 'Spotter',
    },
  },
  2: {
    normal: {
      emoji: '💂‍♂️',
      name: 'Panzerbesatzung',
    },
    squadlead: {
      emoji: '🤠',
      name: 'Panzerkommandant',
    },
  },
  3: {
    normal: {
      emoji: '💂‍♂️',
      name: 'Geschützbesatzung',
    },
    squadlead: {
      emoji: '🤠',
      name: 'Batterieführer',
    },
  },
};

export interface RegistrationConfig {
  reactions: {
    AN: string;
    AB: string;
    RE: string;
    locked: string;
    closed: string;
  };
  roleReactions: {
    0: {
      normal: {
        emoji: string;
        name: string;
      };
      squadlead: {
        emoji: string;
        name: string;
      };
    };
    1: {
      normal: {
        emoji: string;
        name: string;
      };
      squadlead: {
        emoji: string;
        name: string;
      };
    };
    2: {
      normal: {
        emoji: string;
        name: string;
      };
      squadlead: {
        emoji: string;
        name: string;
      };
    };
    3: {
      normal: {
        emoji: string;
        name: string;
      };
      squadlead: {
        emoji: string;
        name: string;
      };
    };
  };
}

export default registerAs(
  'registration',
  (): RegistrationConfig => ({
    reactions: {
      AN: process.env.AN_EMOJI || '✅',
      AB: process.env.AB_EMOJI || '❌',
      RE: process.env.RE_EMOJI || '❔',
      closed: process.env.CLOSED_EMOJI || '🛑',
      locked: process.env.LOCKED_EMOJI || '🔒',
    },
    roleReactions: roleReactions,
  }),
);
