import { ButtonInteraction } from 'discord.js';
import { RegistrationGuard } from '../registration.guard';

describe('maprecorderGuard', () => {
  let registrationGuard: RegistrationGuard;
  let interaction: ButtonInteraction;

  beforeEach(() => {
    registrationGuard = new RegistrationGuard();
    interaction = {
      customId: '12-squadlead-register',
    } as unknown as ButtonInteraction;
  });

  it('should return true if message ends with register', () => {
    expect(registrationGuard.canActive('interactionCreate', [interaction])).toBe(true);
  });

  it("should return false if message doesn't end with register", () => {
    interaction.customId = '12-squadlead-test';
    expect(registrationGuard.canActive('interactionCreate', [interaction])).toBe(false);
  });
});
