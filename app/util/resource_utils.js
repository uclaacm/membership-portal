const { Resource } = require('../db');

const populateEventsWithResources = (events) => {
  if (!events) return Promise.resolve(events);
  return Resource.getResourcesForEvents(events.map(e => e.uuid)).then((allResources) => {
    const eventToResourcesMap = {};
    allResources.forEach((res) => {
      const resPublic = res.getPublic();
      if (!eventToResourcesMap[resPublic.event]) eventToResourcesMap[resPublic.event] = [];
      eventToResourcesMap[resPublic.event].push(resPublic);
    });
    return events.map(event => ({
      ...event,
      resources: eventToResourcesMap[event.uuid] || [],
    }));
  });
};

const populateOneEventWithResources = (event) => {
  if (!event) return Promise.resolve(event);
  return Resource.getResourcesForOneEvent(event.uuid).then(resources => ({
    ...event,
    resources: resources.map(res => res.getPublic()),
  }));
};

module.exports = {
  populateEventsWithResources,
  populateOneEventWithResources,
};
