import Config from 'config';

const getLevel = points => {
  // yes, this could be more efficient with binary search
  // however we wont have more than like 10 levels...
  let currLevel = Config.levels[0];
  let nextLevel = Config.levels[1];
  let currLevelNumber = 0;
  for (let i = 0; i < Config.levels.length; i++) {
      if (Config.levels[i].startsAt > points) {
          currLevel = Config.levels[i - 1];
          currLevelNumber = i - 1;
          nextLevel = Config.levels[i];
          break;
      }
  }
    return { currLevel, nextLevel, currLevelNumber };
}

export { getLevel }