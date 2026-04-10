'use client';

const shimmer = `
@keyframes rideShimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
`;

function SkeletonBox({ width, height, borderRadius = 12, style = {} }) {
  return (
    <div style={{
      width: width || '100%',
      height: height || 20,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(135,82,254,.06) 25%, rgba(135,82,254,.12) 50%, rgba(135,82,254,.06) 75%)',
      backgroundSize: '800px 100%',
      animation: 'rideShimmer 1.5s ease-in-out infinite',
      ...style
    }} />
  );
}

export function CardSkeleton({ count = 3 }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ display: 'grid', gap: 14 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass card" style={{ padding: '20px 22px', display: 'grid', gap: 10 }}>
            <SkeletonBox width="60%" height={18} />
            <SkeletonBox width="40%" height={14} />
            <SkeletonBox width="80%" height={14} />
          </div>
        ))}
      </div>
    </>
  );
}

export function ListingSkeleton({ count = 4 }) {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="glass card" style={{ overflow: 'hidden', borderRadius: 16 }}>
            <SkeletonBox height={160} borderRadius={0} />
            <div style={{ padding: '16px 18px', display: 'grid', gap: 8 }}>
              <SkeletonBox width="70%" height={18} />
              <SkeletonBox width="50%" height={14} />
              <SkeletonBox width="30%" height={22} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function ChatSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ display: 'grid', gap: 12, padding: '20px 0' }}>
        <SkeletonBox width="50%" height={36} style={{ justifySelf: 'start' }} borderRadius={16} />
        <SkeletonBox width="65%" height={36} style={{ justifySelf: 'end' }} borderRadius={16} />
        <SkeletonBox width="45%" height={36} style={{ justifySelf: 'start' }} borderRadius={16} />
        <SkeletonBox width="55%" height={36} style={{ justifySelf: 'end' }} borderRadius={16} />
      </div>
    </>
  );
}

export function PageSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px', display: 'grid', gap: 20 }}>
        <SkeletonBox width="40%" height={28} />
        <SkeletonBox width="70%" height={16} />
        <SkeletonBox height={200} borderRadius={16} />
        <SkeletonBox height={120} borderRadius={16} />
      </div>
    </>
  );
}
