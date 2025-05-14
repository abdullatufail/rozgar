/**
 * Cron Jobs for the Rozgar backend
 * 
 * This file sets up scheduled tasks that run at specific intervals.
 */

import { CronJob } from 'cron';
import { processAutoCancelledOrderRefunds } from './db/triggers';
import { checkAndUpdateLateOrders } from './services/orderService';

// Process refunds for auto-cancelled orders every hour
export const refundProcessor = new CronJob(
  '0 * * * *', // Run every hour at minute 0
  async () => {
    try {
      console.log('Running scheduled refund processing...');
      await processAutoCancelledOrderRefunds();
    } catch (error) {
      console.error('Error in refund processing cron job:', error);
    }
  },
  null, // onComplete
  false, // start
  'UTC' // timezone
);

// Check for late orders every 30 minutes
export const lateOrderChecker = new CronJob(
  '*/30 * * * *', // Run every 30 minutes
  async () => {
    try {
      console.log('Checking for late orders...');
      await checkAndUpdateLateOrders();
    } catch (error) {
      console.error('Error in late order checker cron job:', error);
    }
  },
  null, // onComplete
  false, // start
  'UTC' // timezone
);

export function startCronJobs() {
  console.log('Starting scheduled tasks...');
  refundProcessor.start();
  lateOrderChecker.start();
  console.log('Scheduled tasks started successfully');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping scheduled tasks...');
  refundProcessor.stop();
  lateOrderChecker.stop();
  process.exit(0);
}); 