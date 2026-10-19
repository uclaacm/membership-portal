import Avatar from "@/components/Avatar";

export default function OfficerTile({ officer }) {
  const { name, position, email, picture } = officer;
  return (
    <div className="officer-tile">
      <Avatar name={name} picture={picture} size={70} />
      <div className="content">
        {name && <span className="name">{name}</span>}
        {position && <span className="position">{position}</span>}
        {email && <span className="email">{email}</span>}
      </div>
    </div>
  );
}
