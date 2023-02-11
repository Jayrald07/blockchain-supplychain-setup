import "./button.index.css";

function getPosition(position: String) {
  let pos = "btn";
  switch (position) {
    case "block":
      pos += " btn-block";
      break;
    case "right":
      pos += " btn-end";
      break;
    case "left":
      pos += " btn-start";
      break;
    default:
      pos += " btn-block";
      break;
  }
  return pos;
}

export default ({
  handleClick = () => {},
  label,
  position = "block",
}: {
  handleClick?: React.MouseEventHandler;
  label: String;
  position?: String;
}) => {
  const pos = getPosition(position);
  return (
    <div className="btn-container">
      <button className={pos} onClick={handleClick}>
        {label}
      </button>
    </div>
  );
};
