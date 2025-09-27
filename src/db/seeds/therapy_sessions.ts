import { db } from '@/db';
import { user, therapySessions } from '@/db/schema';

async function main() {
    // Check if there are any users in the database
    const existingUsers = await db.select().from(user).limit(1);
    
    if (existingUsers.length === 0) {
        console.log('⚠️ No users found in database. Skipping therapy sessions seeding.');
        return;
    }

    const firstUserId = existingUsers[0].id;

    const sampleTherapySessions = [
        {
            userId: firstUserId,
            date: '2024-12-15',
            time: '10:00',
            type: 'CBT',
            note: 'Worked on anxiety management techniques',
            exercises: JSON.stringify(['Box Breathing', 'Progressive Muscle Relaxation']),
            createdAt: new Date('2024-12-15T10:00:00Z'),
            updatedAt: new Date('2024-12-15T10:00:00Z'),
        },
        {
            userId: firstUserId,
            date: '2024-12-12',
            time: '14:30',
            type: 'DBT',
            note: 'Practiced mindfulness and distress tolerance',
            exercises: JSON.stringify(['Mindful Breathing', 'TIPP Technique']),
            createdAt: new Date('2024-12-12T14:30:00Z'),
            updatedAt: new Date('2024-12-12T14:30:00Z'),
        },
        {
            userId: firstUserId,
            date: '2024-12-08',
            time: '09:15',
            type: 'EMDR',
            note: 'Processing childhood memories',
            exercises: JSON.stringify(['Bilateral Stimulation', 'Safe Place Visualization']),
            createdAt: new Date('2024-12-08T09:15:00Z'),
            updatedAt: new Date('2024-12-08T09:15:00Z'),
        },
        {
            userId: firstUserId,
            date: '2024-12-05',
            time: '16:00',
            type: 'ACT',
            note: 'Values clarification session',
            exercises: JSON.stringify(['Values Assessment', 'Commitment Exercise']),
            createdAt: new Date('2024-12-05T16:00:00Z'),
            updatedAt: new Date('2024-12-05T16:00:00Z'),
        }
    ];

    await db.insert(therapySessions).values(sampleTherapySessions);
    
    console.log('✅ Therapy sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});