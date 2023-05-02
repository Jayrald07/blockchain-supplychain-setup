import { Component, ReactNode } from "react";
import "./alert.index.css";

export default ({
  children,
  title,
  type,
}: {
  children: ReactNode;
  title: string;
  type: "success" | "error";
}) => {
  return (
    <div className={`border ${type === "success" ? "border-green-200" : "border-red-200"} rounded p-3 px-4 ${type === "success" ? "bg-green-50" : "bg-red-50"} mb-3`}>
      {title ? <h4 className={`${type === "success" ? "text-green-600" : "text-red-600"}`}>{title}</h4> : null}
      <div className={`${type === "success" ? "text-green-600" : "text-red-600"} text-sm font-light`}>
        {children}
      </div>
    </div>
  );
};
