import "./input.index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default ({
  label,
  placeholder,
  icon,
  type,
  multiple = false,
  items = [],
  value = "",
  handleChange = () => {},
  required = false,
}: any) => {
  return (
    <div className="input-container-p">
      <label>{label}</label>
      <div className="input-container">
        <div className="input-icon-container">
          <FontAwesomeIcon icon={icon} />
        </div>
        {!multiple ? (
          <input
            required={required}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e: any) => handleChange(e.target.value)}
          />
        ) : (
          <select
            required={required}
            value={value}
            onChange={(e: any) => handleChange(e.target.value)}
            placeholder="Select Type"
          >
            {items.map((item: any) => (
              <option key={item._id} value={item._id}>
                {item.organization_type_name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
