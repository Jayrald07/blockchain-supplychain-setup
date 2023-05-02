import "./Setup.css";
import Logo from "./assets/logo.png";
import Input from "./Components/Input/input.index";
import {
  faCheckCircle,
  faChevronRight,
  faEllipsis,
  faKey,
  faSpinner,
  faUser,
  faUsers,
  faServer
} from "@fortawesome/free-solid-svg-icons";
import ButtonIndex from "./Components/Button/button.index";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { cleanString, isPasswordValid } from "./utils";
import AlertIndex from "./Components/Alert/alert.index";
import { Socket, io } from "socket.io-client"


const api = axios.create({ baseURL: import.meta.env.VITE_BACKEND_API });
// const peer = axios.create({ baseURL: location.origin });
const peer = axios.create({ baseURL: location.origin });
export default () => {
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [hostname, setHostname] = useState("");
  const [isForCurrentHostname, setIsForCurrentHostname] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [types, setTypes] = useState([]);
  const [errors, setErrors]: [string[], any] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [identifier, setIdentifer] = useState("");
  const [processes, setProcesses] = useState<{ name: string, status: boolean }[]>([]);
  const socket = useRef<Socket>();

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
            orgName: cleanString(orgName.replaceAll(" ", "").trim()),
            username,
            password,
            id: data.details.id,
            hostname: isForCurrentHostname ? location.hostname : hostname
          });
          if (node.message === "Done") {
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

  const handleProcess = (data: { message: string, details: { name: string, status: boolean, position: number } }) => {
    setTimeout(() => {
      setProcesses(prevProcesses => {
        if (prevProcesses[data.details.position]) {
          prevProcesses[data.details.position].name = data.details.name;
          prevProcesses[data.details.position].status = data.details.status;
          return prevProcesses;
        } else return [...prevProcesses, data.details];
      })
    }, 2000);
  }

  useEffect(() => {
    socket.current = io(location.origin).on("connected", console.log)
      .on("generatePorts", handleProcess)
      .on("createCa", handleProcess)
      .on("createOrderer", handleProcess)
      .on("createOrg", handleProcess)
      .on("finalize", data => {
        handleProcess(data)
        if (data.details.status) {
          setTimeout(() => {
            setErrors([]);
            setIsSubmitting(true);
            setIsSuccess(true);
          }, 5000);
        }
      })
  }, []);

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
    <div className="bg-slate-100 h-full flex justify-center">
      {isSuccess ? (
        <div className="flex flex-col mt-10">
          <AlertIndex title="Success" type="success">
            <p>Your account is successfully setup.</p>
            <p>Please follow the instructions below</p>
          </AlertIndex>
          <div className="setup-instructions">
            <h1 className="mt-4">Your account is already pre-created.</h1>
            <small className="font-light block mb-3">
              To fully connect your node to the web application
              the following procedure must be done:
            </small>
            <ol className="list-decimal ml-9 text-sm font-light space-y-2">
              <li>
                Copy the ID shown below
                <pre className="border mt-2 p-2 bg-white block">{identifier}</pre>
              </li>
              <li>Go to <a href="http://chainblockdirect.live:1234" className="underline">http://chainblockdirect.live:1234</a>, and click "Connect it here".</li>
              <li>
                Input the ID in the registration form you got from step 1.
              </li>
              <li>
                Once the ID is verified true, you have to input the username and
                password you created.
              </li>
              <li>
                Lastly, Once the username and password is verified true, you<br />
                have to input the IP address and port of your server/host, so<br />
                the system can verify it.
              </li>
            </ol>
            <h1 className="mt-4">That's it!</h1>
            <small className="font-light">
              You are now connected to the web application
            </small>
            <div className="mt-5">
              <h1 className="mb-3">Logs</h1>
              <details className="border py-2 px-3 bg-white cursor-pointer mb-2">
                <summary className="text-sm">Mini Server</summary>
              </details>
              <details className="border py-2 px-3 bg-white cursor-pointer mb-2">
                <summary className="text-sm">CA Server</summary>
                <textarea rows={10} className="w-full text-xs font-light outline-none whitespace-nowrap mt-2">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laborum autem aperiam ab eligendi ullam ex iure facere reprehenderit sunt quae aliquam nam culpa distinctio excepturi, pariatur nobis minima alias delectus?
                </textarea>
              </details>
              <details className="border py-2 px-3 bg-white cursor-pointer mb-2">
                <summary className="text-sm">Orderer</summary>
              </details>
              <details className="border py-2 px-3 bg-white cursor-pointer mb-2">
                <summary className="text-sm">Peer</summary>
              </details>
            </div>
          </div>
        </div>
      ) : !isSubmitting ? (
        <div className="flex flex-col justify-center items-center">
          <img src={Logo} draggable="false" className="w-48 mb-4" />
          <div className="rounded py-5 px-4 shadow-md bg-white">
            <h1 className="mb-3">Setup your account</h1>
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
                multiple={true}
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
              {
                !isForCurrentHostname ?
                  <Input
                    label="Host/IP address"
                    type="text"
                    placeholder="Ex.: 10.0.0.1 or chaindirect.com"
                    icon={faServer}
                    value={hostname}
                    handleChange={setHostname}
                    required
                  /> : <small className="font-light block w-full"><b>Hostname:</b> {location.hostname}</small>
              }

              <div className="mb-4">
                <div className="flex items-center">
                  <input checked={isForCurrentHostname} type="checkbox" onChange={(e) => setIsForCurrentHostname(e.target.checked)} />
                  <label className="ml-2 text-sm block">Use current host instead</label>
                </div>
              </div>
              <ButtonIndex label="Done" position="left" />
            </form>
          </div>
        </div>
      ) : (
        <ol className="processes-container">
          {
            processes.map(process => {
              return <li key={process.name} className={!process.status ? 'processes-loading-item' : ''}>
                <span className={!process.status ? 'processes-loading' : ''}>
                  {process.name}
                </span>
                {
                  process.status ? <FontAwesomeIcon icon={faCheckCircle} className="processes-done" /> : <FontAwesomeIcon icon={faSpinner} className="spinner" />
                }
              </li>
            })
          }
        </ol>
      )}
    </div>
  );
};
