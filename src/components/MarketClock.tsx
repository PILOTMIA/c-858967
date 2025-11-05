
import { useEffect, useState } from 'react';

interface TradingSession {
  name: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  color: string;
}

const MarketClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTradingSessions = (): TradingSession[] => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const currentUtcTime = utcHour + utcMinute / 60;

    return [
      {
        name: 'Sydney',
        isOpen: currentUtcTime >= 21 || currentUtcTime < 6,
        openTime: '21:00 UTC',
        closeTime: '06:00 UTC',
        color: 'text-blue-400'
      },
      {
        name: 'Tokyo',
        isOpen: currentUtcTime >= 23 || currentUtcTime < 8,
        openTime: '23:00 UTC',
        closeTime: '08:00 UTC',
        color: 'text-red-400'
      },
      {
        name: 'London',
        isOpen: currentUtcTime >= 7 && currentUtcTime < 16,
        openTime: '07:00 UTC',
        closeTime: '16:00 UTC',
        color: 'text-green-400'
      },
      {
        name: 'New York',
        isOpen: currentUtcTime >= 12 && currentUtcTime < 21,
        openTime: '12:00 UTC',
        closeTime: '21:00 UTC',
        color: 'text-yellow-400'
      }
    ];
  };

  const sessions = getTradingSessions();
  const activeSessions = sessions.filter(session => session.isOpen);

  return (
    <div className="mb-6 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Market Clock & Trading Sessions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-lg font-bold text-foreground">UTC Time: {currentTime.toUTCString().split(' ')[4]}</p>
          <p className="text-sm text-muted-foreground">Local Time: {currentTime.toLocaleTimeString()}</p>
        </div>
        <div>
          <p className="text-lg font-bold mb-2 text-foreground">
            Active Sessions: {activeSessions.length > 0 ? activeSessions.map(s => s.name).join(', ') : 'None'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {sessions.map(session => (
          <div 
            key={session.name}
            className={`p-3 rounded border transition-all ${session.isOpen ? 'border-success bg-success/10' : 'border-border bg-muted/50'}`}
          >
            <div className={`font-bold ${session.color}`}>{session.name}</div>
            <div className="text-xs text-muted-foreground">{session.openTime} - {session.closeTime}</div>
            <div className={`text-xs font-bold mt-1 ${session.isOpen ? 'text-success' : 'text-muted-foreground'}`}>
              {session.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketClock;
