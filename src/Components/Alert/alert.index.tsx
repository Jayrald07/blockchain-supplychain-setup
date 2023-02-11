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
    <div className={`alert-container alert-${type}`}>
      {title ? <h4>{title}</h4> : null}
      {children}
    </div>
  );
};
