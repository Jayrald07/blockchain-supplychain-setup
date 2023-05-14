import "./input.index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";

export default ({
  label,
  placeholder,
  icon,
  type,
  multiple = false,
  items = [],
  value = "",
  handleChange = () => { },
  required = false,
  description = ""
}: any) => {


  useEffect(() => {
    if (multiple == true) {
      if (items.length) {
        handleChange(items[0]._id);
      } else console.log("s")
    }
  }, [items]);

  return (
    <div>
      <label className="text-sm block">{label}</label>
      <small className="font-light text-xs mb-2 block">{description}</small>
      <div className="flex border mb-3 items-center bg-slate-100">
        <div className="px-3 text-slate-800 bg-slate-100">
          <FontAwesomeIcon icon={icon} />
        </div>
        {!multiple ? (
          <input
            required={required}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e: any) => handleChange(e.target.value)}
            className="outline-none p-2 w-full font-light text-sm"
          />
        ) : (
          <select
            required={required}
            value={value}
            onChange={(e: any) => handleChange(e.target.value)}
            placeholder="Select Type"
            className="outline-none p-2 w-full font-light text-sm bg-white"
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
