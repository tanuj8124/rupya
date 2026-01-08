import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || !session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.id as string

        // Fetch recent behavior sessions
        const sessions = await db.behaviorSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        })

        // Fetch recent flagged transactions
        const flaggedTransactions = await db.transaction.findMany({
            where: {
                userId,
                riskScore: { gt: 50 }
            },
            orderBy: { date: 'desc' },
            take: 5
        })

        return NextResponse.json({
            sessions: sessions.map((s: any) => ({
                id: s.id,
                score: s.score,
                riskLevel: s.riskLevel,
                time: s.createdAt,
                device: "Verified Browser", // Placeholder since we don't store agent yet
                location: "Detected Location", // Placeholder
            })),
            alerts: flaggedTransactions.map((tx: any) => ({
                id: tx.id,
                title: tx.riskScore! > 70 ? 'High Risk Transaction Blocked' : 'Unusual Transaction Flagged',
                description: `A transfer of $${tx.amount} to ${tx.description.split(': ')[0].replace('Transfer to ', '')} was flagged with a risk score of ${tx.riskScore}.`,
                time: tx.date,
                severity: tx.riskScore! > 70 ? 'HIGH' : 'MEDIUM'
            }))
        })

    } catch (error) {
        console.error('Security API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
