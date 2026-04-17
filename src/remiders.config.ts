export interface ReminderConfig {
    cronExpression: string;
    message: string;
    // channelId: string;
}

export const REMINDERS: ReminderConfig[] = [
    {
        cronExpression: '0 42 2 * * *', // Every day at 9 AM
        message: '@everyone Good morning! This is your daily reminder to check your schedule and stay organized.',
    },
    {
        cronExpression: '0 9 * * *', // Every day at 9 AM
        message: 'Good morning! This is your daily reminder to check your schedule and stay organized.',
    },
    {
        cronExpression: '0 9 * * *', // Every day at 9 AM
        message: 'Good morning! This is your daily reminder to check your schedule and stay organized.',
    }
]