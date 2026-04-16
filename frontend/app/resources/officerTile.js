export default function OfficerTile({ officer }) {
  const { name, position, email, picture } = officer;
  return (
    <div className="officer-tile">
      <img src={picture} alt={name} />
      <div className="content">
        {name && <span className="name">{name}</span>}
        {position && <span className="position">{position}</span>}
        {email && <span className="email">{email}</span>}
      </div>
    </div>
  );
}
