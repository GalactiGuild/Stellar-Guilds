import React from 'react';

// Responsive Grid Layout Scaffold for Bounties
// Addresses issue #289

interface Bounty {
  id: string;
  title: string;
  reward: string;
}

interface BountyGridProps {
  bounties: Bounty[];
}

export const BountyGrid: React.FC<BountyGridProps> = ({ bounties }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '16px',
      padding: '16px',
    }}>
      {bounties.map(bounty => (
        <div key={bounty.id} style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <h3 style={{ margin: 0 }}>{bounty.title}</h3>
          <span style={{ color: '#666' }}>{bounty.reward}</span>
        </div>
      ))}
    </div>
  );
};

export default BountyGrid;
