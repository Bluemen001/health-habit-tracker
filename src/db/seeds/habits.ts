import { db } from '@/db';
import { habits, user } from '@/db/schema';

async function main() {
    // Check if there are any users in the database
    const existingUsers = await db.select({ id: user.id }).from(user).limit(1);
    
    if (existingUsers.length === 0) {
        console.log('⚠️ No users found in database. Skipping habits seeding.');
        return;
    }
    
    const userId = existingUsers[0].id;
    
    const sampleHabits = [
        {
            userId: userId,
            name: 'Daily Meditation',
            targetPerWeek: 7,
            progress: 65,
            streak: 12,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: userId,
            name: 'Drink 8 Glasses of Water',
            targetPerWeek: 7,
            progress: 80,
            streak: 5,
            createdAt: new Date('2024-01-20').toISOString(),
            updatedAt: new Date('2024-01-20').toISOString(),
        },
        {
            userId: userId,
            name: '30min Exercise',
            targetPerWeek: 4,
            progress: 45,
            streak: 3,
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: userId,
            name: 'Read for 20 Minutes',
            targetPerWeek: 5,
            progress: 90,
            streak: 8,
            createdAt: new Date('2024-02-01').toISOString(),
            updatedAt: new Date('2024-02-01').toISOString(),
        },
        {
            userId: userId,
            name: 'Take Vitamins',
            targetPerWeek: 7,
            progress: 35,
            streak: 2,
            createdAt: new Date('2024-02-05').toISOString(),
            updatedAt: new Date('2024-02-05').toISOString(),
        }
    ];

    await db.insert(habits).values(sampleHabits);
    
    console.log('✅ Habits seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});