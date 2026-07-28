import { repo } from '@/data/db';
import { getDataVersion, subscribeData } from '@/data/events';
import { ChallengePreset } from '@/data/repository';

const TODAY = '2026-07-27';

const PRESET: ChallengePreset = {
  name: 'Notify',
  durationDays: 5,
  dailyThresholdPct: 80,
  challengeThresholdPct: 80,
  strictness: 'flexible',
  noRepeatMiss: false,
  travelExemption: false,
  categories: [{ id: 'c', name: 'C' }],
  items: [{ id: 'a', categoryId: 'c', label: 'A', isBonus: false, timeOfDay: 'day' }],
};

describe('NotifyingRepository', () => {
  it('bumps the data version and notifies subscribers on every mutation', () => {
    let notified = 0;
    const unsubscribe = subscribeData(() => notified++);
    const before = getDataVersion();

    const active = repo.startChallenge(PRESET, TODAY);
    repo.setItemDone(active.attemptId, 0, 'a', true);
    repo.setDayMeta(active.attemptId, 0, { mood: 3 });
    repo.closeDay(active.attemptId, 0, '2026-07-28');
    repo.setSetting('k', 'v');
    repo.updateChallengeConfig(active.challengeId, { name: 'Renamed' });
    repo.deleteChallenge(active.challengeId);

    expect(notified).toBe(7);
    expect(getDataVersion()).toBe(before + 7);
    unsubscribe();

    repo.setSetting('k', 'w');
    expect(notified).toBe(7); // unsubscribed — no further notifications
  });

  it('reads do not notify', () => {
    let notified = 0;
    const unsubscribe = subscribeData(() => notified++);
    repo.getActive();
    repo.listChallenges();
    repo.getSetting('k');
    repo.exportAllData();
    expect(notified).toBe(0);
    unsubscribe();
  });
});
