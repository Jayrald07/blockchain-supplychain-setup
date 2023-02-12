import "./Setup.css";
import Logo from "./assets/logo.png";
import Input from "./Components/Input/input.index";
import {
  faChevronRight,
  faEllipsis,
  faKey,
  faSpinner,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import ButtonIndex from "./Components/Button/button.index";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { isPasswordValid } from "./utils";
import AlertIndex from "./Components/Alert/alert.index";

const api = axios.create({ baseURL: "http://localhost:8081" });
const peer = axios.create({ baseURL: "http://localhost:8012" });

export default () => {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [types, setTypes] = useState([]);
  const [errors, setErrors]: [string[], any] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [identifier, setIdentifer] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);
    const result = isPasswordValid(password);
    let listErrors: string[] = [];

    if (!orgName.trim())
      listErrors = [...listErrors, "Organization Name is required"];
    if (!orgType.trim())
      listErrors = [...listErrors, "Organization Type is required"];
    if (!username.trim()) listErrors = [...listErrors, "Username is required"];
    if (!password.trim()) listErrors = [...listErrors, "Password is required"];
    if (!repassword.trim())
      listErrors = [...listErrors, "Re-Password is required"];
    if (
      !(
        password.trim() &&
        repassword.trim() &&
        password.trim() === repassword.trim()
      )
    )
      listErrors = [...listErrors, "Password and Re-Password are not matched"];

    if (Object.values(result).length)
      listErrors = [...listErrors, ...(Object.values(result) as string[])];
    if (listErrors.length) setIsSubmitting(false);
    else {
      try {
        const { data } = await api.post("/external", {
          organization_name: orgName,
          organization_type: orgType,
          username,
          password,
        });
        if (data.message === "Done") {
          const { data: node } = await peer.post("/initialize", {
            orgName: `${orgName.replaceAll(" ", "").trim()}.com`,
            username,
            password,
            port: "27051",
            msp: `${orgName.replaceAll(" ", "").trim()}MSP`,
            id: data.details.id,
          });
          if (node.message === "Done") {
            setErrors([]);
            setIsSubmitting(false);
            setIsSuccess(true);
            setIdentifer(data.details.id);
          } else {
            setIsSubmitting(false);
            let values =
              typeof data.details === "string"
                ? data.details
                : Object.values<string>(data.details);
            if (typeof values !== "string") values = [...values];

            listErrors = [...listErrors, values];
            setIsSuccess(false);
          }
        } else {
          setIsSubmitting(false);
          let values =
            typeof data.details === "string"
              ? data.details
              : Object.values<string>(data.details);
          if (typeof values !== "string") values = [...values];

          listErrors = [...listErrors, values];
          setIsSuccess(false);
        }
      } catch (err: any) {
        console.log(err);
        setIsSubmitting(false);
        setIsSuccess(false);
        listErrors = [...listErrors, "Unexpected Error. Please Try Again"];
      }
    }
    setErrors(listErrors);
  };

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/types");
      setTypes(data.types);
    })();
    (async () => {
      const { data } = await peer.get("/getConfig");
      if (data.message === "Done") {
        let setup = data.details[0];
        let id = data.details[1];
        if (setup.name === "SETUP" && setup.value === "done") {
          setIsSuccess(true);
          setIdentifer(id.value);
        }
      }
    })();
  }, []);

  return (
    <div className="setup-container">
      {isSuccess ? (
        <div className="setup-instructions-container">
          <AlertIndex title="Success" type="success">
            <p>Your account is successfully setup.</p>
            <p>Please follow the instructions below</p>
          </AlertIndex>
          <div className="setup-instructions">
            <small>
              <b>Your account is already pre-created.</b> <br />
              To fully connect your node to the web application, <br />
              the following procedure must be done:
            </small>
            <ol>
              <li>
                Copy the ID shown below
                <pre>{identifier}</pre>
              </li>
              <li>Go to http://localhost.com, and click register.</li>
              <li>
                Input the ID in the registration form you got from step 1.
              </li>
              <li>
                Once the ID is verified true, you have to input the username and
                password you created.
              </li>
              <li>
                Lastly, Once the username and password is verified true, you
                have to input the IP address and port of your server/host, so
                the system can verify it.
              </li>
            </ol>
            <small>
              <b>That's it!</b>
              <br />
              You are now connected to the web application
            </small>
          </div>
        </div>
      ) : !isSubmitting ? (
        <>
          <div className="logo-container">
            <img src={Logo} draggable="false" />
            <h1>ChainDirect</h1>
          </div>
          <h1>Setup your account</h1>
          <form onSubmit={handleSubmit}>
            {errors.length ? (
              <AlertIndex title="Input Error" type="error">
                <ul className="errors-content">
                  {errors.length
                    ? errors.map((item: string) => (
                        <li key={item}>
                          <small>
                            <FontAwesomeIcon icon={faChevronRight} /> {item}
                          </small>
                        </li>
                      ))
                    : null}
                </ul>
              </AlertIndex>
            ) : null}
            <Input
              label="Organization Name"
              type="text"
              placeholder="Ex: ABC Corporation"
              icon={faUsers}
              value={orgName}
              handleChange={setOrgName}
              required
            />
            <Input
              label="Organization Type"
              type="text"
              placeholder="Ex: ABC Corporation"
              icon={faEllipsis}
              multiple="true"
              value={orgType}
              handleChange={setOrgType}
              items={types}
              required
            />
            <Input
              label="Username"
              type="text"
              placeholder="Ex: juandelacruz123"
              icon={faUser}
              value={username}
              handleChange={setUsername}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder=""
              icon={faKey}
              value={password}
              handleChange={setPassword}
              required
            />
            <Input
              label="Re-Password"
              type="password"
              placeholder=""
              icon={faKey}
              value={repassword}
              handleChange={setRepassword}
              required
            />
            <ButtonIndex label="Done" position="right" />
          </form>
        </>
      ) : (
        <FontAwesomeIcon icon={faSpinner} className="spinner" />
      )}
    </div>
  );
};
