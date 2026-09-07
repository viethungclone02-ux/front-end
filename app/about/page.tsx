// app/about/page.tsx
'use client';

import Link from 'next/link';

interface InfoCardProps {
    title: string;
    items: string[];
    color: string;
}

function InfoCard({ title, items, color }: InfoCardProps) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            borderTop: `4px solid ${color}`,
            transition: 'transform 0.2s ease-in-out',
            cursor: 'default',
        }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1rem',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '0.5rem'
            }}>
                {title}
            </h2>
            <ul style={{
                listStyleType: 'disc',
                listStylePosition: 'inside',
                color: '#4b5563',
                lineHeight: '1.6'
            }}>
                {items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default function About() {
    const soThich = [
        'Lập trình Web (React, Next.js, Node.js)',
        'Chơi game Đấu Trường Chân Lý (TFT)',
    ];

    const mucTieu = [
        'Xây dựng một sản phẩm cá nhân hữu ích',
    ];

    return (
        <main style={{
            minHeight: '100vh',
            backgroundColor: '#f3f4f6',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            color: '#1f2937'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: '#111827',
                        letterSpacing: '-0.025em',
                        marginBottom: '0.5rem'
                    }}>
                        Giới Thiệu Bản Thân
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
                        Chào mừng đến với trang cá nhân của tôi!
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    <InfoCard
                        title="Sở thích & Đam mê"
                        items={soThich}
                        color="#3b82f6"
                    />
                    <InfoCard
                        title="Mục tiêu nghề nghiệp"
                        items={mucTieu}
                        color="#10b981"
                    />
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link
                        href="/profile"
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            fontWeight: '600',
                            borderRadius: '8px',
                            textDecoration: 'none',
                        }}
                    >
                        ← Quay lại Trang cá nhân
                    </Link>
                </div>
            </div>
        </main>
    );
}