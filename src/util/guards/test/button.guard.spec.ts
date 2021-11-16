import { Interaction } from 'discord.js';
import { ButtonGuard } from '../button.guard';

describe('buttonGuard', () => {
  let buttonGuard: ButtonGuard;
  let interaction: Interaction;

  beforeEach(() => {
    buttonGuard = new ButtonGuard();
    interaction = {
      isButton: jest.fn().mockReturnValue(true),
    } as unknown as Interaction;
  });

  it('should return true if isButton returns true', () => {
    expect(buttonGuard.canActive('interactionCreate', [interaction])).toBe(true);
  });

  it('should return true if isButton returns false', () => {
    interaction.isButton = jest.fn().mockReturnValue(false);
    expect(buttonGuard.canActive('interactionCreate', [interaction])).toBe(false);
  });
});
