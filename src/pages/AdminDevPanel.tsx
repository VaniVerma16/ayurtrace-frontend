import { useState } from "react";
import { healthCheck, seedSpecies, listReadyCollectionEvents, listReadyProcessingSteps, listReadyLabTests, updateCollectionBlockchain, updateProcessingBlockchain, updateLabTestBlockchain } from "@/lib/api";

const AdminDevPanel = () => {
  const [health, setHealth] = useState<string>("");
  const [speciesName, setSpeciesName] = useState("");
  const [speciesCode, setSpeciesCode] = useState("");
  const [seedResult, setSeedResult] = useState<string>("");
  const [chainResults, setChainResults] = useState<any>({});
  const [patchStatus, setPatchStatus] = useState<string>("");

  const handleHealthCheck = async () => {
    const res = await healthCheck();
    setHealth(JSON.stringify(res));
  };

  const handleSeedSpecies = async () => {
    const res = await seedSpecies(speciesName, speciesCode);
    setSeedResult(JSON.stringify(res));
  };

  const handleChainFetch = async () => {
    const collections = await listReadyCollectionEvents();
    const processing = await listReadyProcessingSteps();
    const labtests = await listReadyLabTests();
    setChainResults({ collections, processing, labtests });
  };

  const handlePatch = async (type: string, id: string, status: string, hash: string) => {
    let res;
    if (type === "collection") res = await updateCollectionBlockchain(id, status, hash);
    else if (type === "processing") res = await updateProcessingBlockchain(id, status, hash);
    else if (type === "labtest") res = await updateLabTestBlockchain(id, status, hash);
    setPatchStatus(JSON.stringify(res));
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Admin / Dev Panel</h2>
      <div style={{ marginBottom: 24 }}>
        <button onClick={handleHealthCheck}>Health Check</button>
        <div>Result: {health}</div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Seed Species (Dev Only)</h3>
        <input placeholder="Scientific Name" value={speciesName} onChange={e => setSpeciesName(e.target.value)} />
        <input placeholder="Species Code" value={speciesCode} onChange={e => setSpeciesCode(e.target.value)} />
        <button onClick={handleSeedSpecies}>Seed Species</button>
        <div>Result: {seedResult}</div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Blockchain Chain Queries</h3>
        <button onClick={handleChainFetch}>Fetch Ready Items</button>
        <pre style={{ background: '#eee', padding: 8 }}>{JSON.stringify(chainResults, null, 2)}</pre>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h3>Update Blockchain Status/Hash</h3>
        <form onSubmit={e => {
          e.preventDefault();
          const type = (e.target as any).type.value;
          const id = (e.target as any).id.value;
          const status = (e.target as any).status.value;
          const hash = (e.target as any).hash.value;
          handlePatch(type, id, status, hash);
        }}>
          <select name="type">
            <option value="collection">Collection</option>
            <option value="processing">Processing</option>
            <option value="labtest">Lab Test</option>
          </select>
          <input name="id" placeholder="ID" />
          <input name="status" placeholder="Status" />
          <input name="hash" placeholder="Hash" />
          <button type="submit">Patch</button>
        </form>
        <div>Result: {patchStatus}</div>
      </div>
    </div>
  );
};

export default AdminDevPanel;
