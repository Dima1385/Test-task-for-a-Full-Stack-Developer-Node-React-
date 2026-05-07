export default function ResultBox({ result }) {
  if (!result) return null;

  const rows = [
    { key: 'Option',        value: result.option },
    { key: 'Input value',   value: result.inputValue },
    { key: 'Output value',  value: result.output },
    { key: 'Processed at',  value: new Date(result.processedAt).toLocaleTimeString() },
  ];

  return (
    <div className="result-box">
      <p className="result-box__title">Result</p>
      {rows.map(({ key, value }) => (
        <div key={key} className="result-row">
          <span className="result-row__key">{key}</span>
          <span className="result-row__value">{String(value ?? '—')}</span>
        </div>
      ))}
    </div>
  );
}
