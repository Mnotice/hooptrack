import '../styles/InputBlueprint.css'

export default function InputBlueprint() {
  const zones = [
    { abbr: 'TL', full: 'Top / Key', aliases: ['top', 'key', 'elbow'] },
    { abbr: 'LW', full: 'Left Wing', aliases: ['left wing', 'l wing'] },
    { abbr: 'RW', full: 'Right Wing', aliases: ['right wing', 'r wing'] },
    { abbr: 'LC', full: 'Left Corner', aliases: ['left corner', 'l corner'] },
    { abbr: 'RC', full: 'Right Corner', aliases: ['right corner', 'r corner'] },
  ]

  return (
    <div className="input-blueprint">
      <h4 className="blueprint-title">📍 Zone Abbreviations</h4>
      <div className="blueprint-grid">
        {zones.map((zone, idx) => (
          <div key={idx} className="blueprint-item">
            <span className="zone-abbr">{zone.abbr}</span>
            <span className="zone-full">{zone.full}</span>
          </div>
        ))}
      </div>
      
      <div className="blueprint-examples">
        <h5>💬 Command Examples:</h5>
        <ul>
          <li><code>"+1 TL"</code> — Made one shot from top</li>
          <li><code>"-1 RW"</code> — Missed one shot from right wing</li>
          <li><code>"made 7 of 10 LC"</code> — Made 7 of 10 from left corner</li>
          <li><code>"end session"</code> — Finish workout</li>
        </ul>
      </div>
    </div>
  )
}
