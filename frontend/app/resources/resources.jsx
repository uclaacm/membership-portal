import Config from '@/lib/config';
import ResourceCard from './resourceCard';
import OfficerTile from './officerTile';

export default function Resources() {
  return (
    <div className="resources-wrapper">
      <div className="org-info">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={Config.organization.logo} alt={Config.organization.name} />
        <h1>{Config.organization.name}</h1>
        <p>{Config.organization.mission}</p>
      </div>
      <div className="divider" />
      <div className="resources">
        {Config.organization.resources.map(resource => (
          <ResourceCard resource={resource} key={resource.type || resource.name} />
        ))}
      </div>
      {[
        { title: 'Current Dev Team', key: 'currentDevTeam' },
        { title: 'Dev Team Directors', key: 'devTeamDirectors' },
        { title: 'Founding Team', key: 'foundingTeam' },
      ].map(({ title, key }) =>
        Config.organization[key]?.length > 0 ? (
          <div key={key}>
            <div className="divider" />
            <h2 className="officer-section-title">{title}</h2>
            <div className="officers">
              {Config.organization[key].map(officer => (
                <OfficerTile officer={officer} key={officer.name} />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
