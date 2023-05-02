import axios from "axios";
import { useState, useEffect } from "react";


const peer = axios.create({ baseURL: location.origin });
export const Logs = ({ component, label }: { component: string, label: string }) => {

  const [logs, setLogs] = useState("");
  const [count, setCount] = useState(100);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await peer.post("/logsOf", { component, count });
        console.log({ data })
        if (data.message === "Done") setLogs(data.details);
        else setLogs(`Error: ${data.details}`);
      } catch (error: any) {
        setLogs(error.message);
      }
    })();
  }, []);

  return <details className="border py-2 px-3 bg-white cursor-pointer mb-2">
    <summary className="text-sm">{label}</summary>
    <textarea value={logs} rows={10} className="w-full text-xs font-light outline-none whitespace-nowrap mt-2">
    </textarea>
  </details>
}