import axios from "axios";
import { getApiEndpoint } from "../util/api";
import { useEffect, useState } from "react";
import { QrReader } from 'react-qr-reader';
import { generateDisplayName } from "../util/part";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const ScanResult = (param) => {

    const [part, setPart] = useState(undefined);
    const [scanResult, setScanResult] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (param.scanData.startsWith("part#")) {
            setScanResult(Object.fromEntries(param.scanData.split("#").slice(1, param.scanData.length).map((e) => {return e.split("=")})))
        }
    }, [param.scanData]);
    useEffect(() => {
        axios
        .get(getApiEndpoint("/part"), { params: { id: scanResult?.id } })
        .then((response) => {
          if (response.status === 200) {
            setPart(response.data);
          }
        }).catch((e) => {});
    }, [scanResult])

    useEffect(() => {
        console.log(part);
    }, [part])
    return (part ? <><Button onClick={() => {
        navigate("/part/" + part.id);
    }} variant="link" className="text-info"><b>#{part.id}</b> - {generateDisplayName(part)}</Button></> : <></>)
}

const PartScanner = () => {
    
  const [data, setData] = useState('No result');
  const [recentScans, setRecentScans] = useState([])

  useEffect(() => {
    setRecentScans([data, ...recentScans])
  }, [data])

  useEffect(() => {
    if (recentScans.length > 5) {
        setRecentScans(recentScans.slice(0, recentScans.length - 1))
    }
  }, [recentScans])

  return (
    <>
      <h1>Scanner:</h1>
      <hr></hr>
      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            setData(result?.text);
          }

        }}
        style={{ width: '100%' }}
      />
      <h3>Found Parts:</h3>
      <p>{recentScans.map((e) => (<><ScanResult scanData={e}/><br/></>))}</p>
    </>
  );
};

export default PartScanner;
