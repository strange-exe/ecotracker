import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { MOCK_PEERS } from '../domain/mockData';
import { handleTiltMove, handleTiltLeave } from '../utils/tiltHandlers';
import { 
  Trophy, 
  Flame, 
  Award, 
  Shield, 
  Users, 
  CheckCircle,
  Bike,
  Recycle,
  Globe,
  Utensils
} from 'lucide-react';

/**
 * Leaderboard — peer ranking comparison page and milestone awards display.
 *
 * @param {Object} props
 * @param {Object} props.userProfile - Active user configuration containing baseline metrics.
 * @param {number} props.co2Saved - User's total carbon saved this month (kg).
 * @param {number} props.streakDays - Current consecutive tracking days.
 * @param {number} props.userLevel - User's current calculated Eco Level.
 */
export default function Leaderboard({ userProfile, co2Saved, streakDays, userLevel }) {
  const [cohortFilter, setCohortFilter] = useState('all');

  // 3D Tilt mouse handlers - delegates to shared utility (respects prefers-reduced-motion)
  const handleMouseMove = (e) => handleTiltMove(e, 6);
  const handleMouseLeave = handleTiltLeave;

  // Dynamically merge user stats and sort leaderboard
  const sortedLeaderboard = useMemo(() => {
    const peersCopy = MOCK_PEERS.map(peer => {
      if (peer.isUser) {
        return {
          ...peer,
          name: `${userProfile.userName} (You)`,
          savingsThisMonth: co2Saved,
          streakDays: streakDays,
          level: userLevel
        };
      }
      
      let savingsModifier = 1.0;
      if (cohortFilter === 'campus') {
        savingsModifier = peer.name.includes('Eco') || peer.name.includes('Student') ? 1.15 : 0.65;
      } else if (cohortFilter === 'neighborhood') {
        savingsModifier = peer.name.includes('Leader') || peer.name.includes('Waste') ? 0.9 : 1.1;
      }

      return {
        ...peer,
        savingsThisMonth: parseFloat((peer.savingsThisMonth * savingsModifier).toFixed(1))
      };
    });

    return peersCopy.sort((a, b) => b.savingsThisMonth - a.savingsThisMonth);
  }, [userProfile, co2Saved, streakDays, userLevel, cohortFilter]);

  const userRankIndex = useMemo(() => {
    return sortedLeaderboard.findIndex(peer => peer.isUser) + 1;
  }, [sortedLeaderboard]);

  // Milestone Badges Config
  const badges = useMemo(() => {
    return [
      {
        id: 'badge-starter',
        name: 'Carbon Novice',
        description: 'Establish your environmental carbon baseline.',
        requirement: 'Completed onboarding',
        unlocked: true,
        color: '#38bdf8'
      },
      {
        id: 'badge-transit',
        name: 'Transit Champion',
        description: 'Choose walking, biking, or public transit over personal cars.',
        requirement: 'Log transport details',
        unlocked: userProfile.commuteMode === 'active' || userProfile.commuteMode === 'transit' || co2Saved > 5,
        color: '#fbbf24'
      },
      {
        id: 'badge-diet',
        name: 'Green Gourmet',
        description: 'Adopt lower carbon food alternatives or organic crops.',
        requirement: 'Vegan/Vegetarian preference',
        unlocked: userProfile.dietType === 'vegan' || userProfile.dietType === 'vegetarian' || co2Saved > 10,
        color: '#10b981'
      },
      {
        id: 'badge-streak',
        name: 'Daily Devotion',
        description: 'Keep your ecological habit tracking streak alive.',
        requirement: 'Reach 3+ days streak',
        unlocked: streakDays >= 3,
        color: '#f87171'
      },
      {
        id: 'badge-savings',
        name: 'Carbon Buster',
        description: 'Prevent greenhouse gases from entering the air.',
        requirement: 'Save 20+ kg of CO2',
        unlocked: co2Saved >= 20,
        color: '#a78bfa'
      },
      {
        id: 'badge-waste',
        name: 'Zero Waste Wizard',
        description: 'Divert organics and paper away from landfills.',
        requirement: 'Sort kitchen scraps or compost',
        unlocked: userProfile.recyclingHabit === 'full_recycling' || co2Saved > 15,
        color: '#dfad6c'
      }
    ];
  }, [userProfile, co2Saved, streakDays]);

  // SVG badge resolver
  const getBadgeIcon = (id, color) => {
    const size = 22;
    switch (id) {
      case 'badge-starter':
        return <Award size={size} style={{ color }} />;
      case 'badge-transit':
        return <Bike size={size} style={{ color }} />;
      case 'badge-diet':
        return <Utensils size={size} style={{ color }} />;
      case 'badge-streak':
        return <Flame size={size} style={{ color }} />;
      case 'badge-savings':
        return <Globe size={size} style={{ color }} />;
      case 'badge-waste':
        return <Recycle size={size} style={{ color }} />;
      default:
        return <Shield size={size} style={{ color }} />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Peer Comparisons & Awards</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Compare habits with peers, rank up in active cohorts, and earn digital badges for reaching carbon milestones.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid-cols-2">
        
        {/* LEFT COLUMN: Leaderboard list (3D Card) */}
        <div className="tilt-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <section 
            className="tilt-card-inner glass-panel" 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, position: 'relative', overflow: 'hidden' }} 
            aria-labelledby="leaderboard-heading"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', zIndex: 20 }}>
              <h2 id="leaderboard-heading" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} style={{ color: 'var(--accent-earth)' }} /> Savings Leaderboard
              </h2>

              <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
                <button 
                  onClick={() => setCohortFilter('all')} 
                  className="btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '6px', background: cohortFilter === 'all' ? 'var(--primary)' : 'transparent', color: cohortFilter === 'all' ? '#fff' : 'var(--text-muted)' }}
                >
                  All
                </button>
                <button 
                  onClick={() => setCohortFilter('campus')} 
                  className="btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '6px', background: cohortFilter === 'campus' ? 'var(--primary)' : 'transparent', color: cohortFilter === 'campus' ? '#fff' : 'var(--text-muted)' }}
                >
                  Campus
                </button>
                <button 
                  onClick={() => setCohortFilter('neighborhood')} 
                  className="btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', borderRadius: '6px', background: cohortFilter === 'neighborhood' ? 'var(--primary)' : 'transparent', color: cohortFilter === 'neighborhood' ? '#fff' : 'var(--text-muted)' }}
                >
                  Local Area
                </button>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', zIndex: 20 }}>
              Ranked based on total carbon emissions saved (kg CO2e) during the current calendar month.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', zIndex: 20 }}>
              {sortedLeaderboard.map((peer, idx) => {
                const rank = idx + 1;
                  const podiumClass = rank === 1 ? 'podium-gold' : rank === 2 ? 'podium-silver' : rank === 3 ? 'podium-bronze' : '';
                  return (
                    <div 
                      key={peer.name}
                      className={`btn-premium-bounce ${podiumClass}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: rank <= 3 ? undefined : peer.isUser ? 'rgba(74, 222, 128, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                        border: rank <= 3 ? undefined : peer.isUser ? '2px dashed var(--accent-leaf)' : '1px solid rgba(255, 255, 255, 0.03)',
                        transform: peer.isUser && rank > 3 ? 'scale(1.01)' : 'none',
                        transition: 'all 0.3s',
                        perspective: '1000px',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', transformStyle: 'preserve-3d' }}>
                        <div 
                          className="parallax-badge"
                          style={{ 
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            background: rank === 1 ? 'linear-gradient(135deg, #fbbf24, #b45309)' : rank === 2 ? '#9ca3af' : rank === 3 ? '#bfa07a' : 'rgba(255,255,255,0.03)',
                            color: rank <= 3 ? '#111827' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}
                        >
                          {rank}
                        </div>

                        {/* Professional Initial Avatars instead of Emojis */}
                        <div className={`parallax-badge avatar-initials ${peer.isUser ? 'user-avatar' : ''}`}>
                          {peer.avatar}
                        </div>

                        <div className="parallax-text">
                          <h3 style={{ fontSize: '0.9rem', color: peer.isUser ? 'var(--accent-leaf)' : 'var(--text-primary)' }}>
                            {peer.name}
                          </h3>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                              <Award size={10} /> Lvl {peer.level}
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'var(--accent-earth)' }}>
                              <Flame size={10} /> {peer.streakDays}d streak
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', className: 'parallax-text' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-leaf)' }}>
                          {peer.savingsThisMonth} kg
                        </span>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>saved</span>
                      </div>
                    </div>
                  );
              })}
            </div>

            <div style={{ 
              marginTop: 'auto', 
              padding: '0.75rem', 
              background: 'rgba(223, 173, 108, 0.03)', 
              border: '1px solid rgba(223, 173, 108, 0.1)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              zIndex: 20
            }}>
              <Users size={16} style={{ color: 'var(--accent-earth)', flexShrink: 0 }} />
              <span>
                You are ranked <strong>#{userRankIndex}</strong> out of {sortedLeaderboard.length} peers. Maintain your efforts to rank higher!
              </span>
            </div>

          </section>
        </div>

        {/* RIGHT COLUMN: Badge unlocking grid with 3D Tilt Badges */}
        <section aria-labelledby="badges-heading" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 id="badges-heading" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: 'var(--accent-earth)' }} /> Unlocked Milestones
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Earn digital achievements by logging habits and proving eco-excellence.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
              {badges.map(badge => (
                <div key={badge.id} className="tilt-card" style={{ display: 'flex' }}>
                  <div 
                    className="tilt-card-inner"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: badge.unlocked ? 'rgba(223, 173, 108, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                      border: badge.unlocked ? '1px solid rgba(223, 173, 108, 0.25)' : '1px solid rgba(255, 255, 255, 0.03)',
                      opacity: badge.unlocked ? 1 : 0.45,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      position: 'relative',
                      overflow: 'hidden',
                      width: '100%',
                      flex: 1
                    }}
                  >
                    {/* SVG Vector Badge icon */}
                    <div style={{
                      background: badge.unlocked ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid transparent',
                      flexShrink: 0,
                      zIndex: 20
                    }}>
                      {getBadgeIcon(badge.id, badge.unlocked ? badge.color : 'var(--text-muted)')}
                    </div>
                    
                    <div style={{ zIndex: 20 }}>
                      <h3 style={{ fontSize: '0.9rem', color: badge.unlocked ? 'var(--accent-earth)' : 'var(--text-primary)' }}>
                        {badge.name}
                      </h3>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                        {badge.description}
                      </p>
                      <div style={{ 
                        marginTop: '0.4rem', 
                        fontSize: '0.65rem', 
                        color: badge.unlocked ? 'var(--accent-leaf)' : 'var(--text-muted)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.15rem'
                      }}>
                        {badge.unlocked ? (
                          <>
                            <CheckCircle size={10} /> Unlocked
                          </>
                        ) : (
                          `Goal: ${badge.requirement}`
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

Leaderboard.propTypes = {
  userProfile: PropTypes.shape({
    userName: PropTypes.string.isRequired
  }).isRequired,
  co2Saved: PropTypes.number.isRequired,
  streakDays: PropTypes.number.isRequired,
  userLevel: PropTypes.number.isRequired
};
