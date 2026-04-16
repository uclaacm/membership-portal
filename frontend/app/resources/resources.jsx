import Config from '@/lib/config';
import ResourceCard from './resourceCard';
// import OfficerTile from './officerTile';

export default function Resources() {
  return (
    <div className="resources-wrapper">
      <div className="org-info">
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
      {/* We'll add this back in later once officer headshots are available */}
      {/* {Config.organization.officers && Config.organization.officers.length > 0 && (
        <>
          <div className="divider" />
          <div className="officers">
            {Config.organization.officers.map(officer => (
              <OfficerTile officer={officer} key={officer.name} />
            ))}
          </div>
        </>
      )} */}
    </div>
  );
}
