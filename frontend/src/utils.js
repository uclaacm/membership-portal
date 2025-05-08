import Config from 'config';

const getLevel = (points) => {
  // yes, this could be more efficient with binary search
  // however we wont have more than like 10 levels...
  let i = 1;
  while (i < Config.levels.length && points > Config.levels[i].startsAt) {
    i += 1;
  }
  const currLevel = Config.levels[i - 1];
  const nextLevel = i === Config.levels.length ? null : Config.levels[i];
  const currLevelNumber = i - 1;
  return { currLevel, nextLevel, currLevelNumber };
};

export { getLevel };
export default { getLevel };
