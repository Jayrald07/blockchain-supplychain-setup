import "./button.index.css";

export default ({
  handleClick = () => { },
  label,
  position = "block",
}: {
  handleClick?: React.MouseEventHandler;
  label: String;
  position?: String;
}) => {
  return (
    <div className="flex justify-end">
      <button className="text-sm border rounded p-2 px-4" onClick={handleClick}>
        {label}
      </button>
    </div>
  );
};
