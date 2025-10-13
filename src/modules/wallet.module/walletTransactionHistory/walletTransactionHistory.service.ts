//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import { WalletTransactionHistory } from './walletTransactionHistory.model';
import { IWalletTransactionHistory } from './walletTransactionHistory.interface';
import { GenericService } from '../../_generic-module/generic.services';
//@ts-ignore
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  startOfQuarter,
  endOfWeek,
  endOfMonth,
  subWeeks,
  subMonths,
  subDays,
} from 'date-fns';
import { TWalletTransactionHistory, TWalletTransactionStatus } from './walletTransactionHistory.constant';
import { TCurrency } from '../../../enums/payment';
import mongoose from 'mongoose';
import { Wallet } from '../wallet/wallet.model';

export class WalletTransactionHistoryService extends GenericService<
  typeof WalletTransactionHistory,
  IWalletTransactionHistory
> {
  constructor() {
    super(WalletTransactionHistory);
  }

  /********
   * 
   * By Claude |  Working .. 
   * 🎲📊📈🔁 
   * ********* */
  // Get specialist's comprehensive earnings overview
  async getSpecialistEarningsOverview(userId: string) {
    
    /*------------------------------------------
    {
      "_id": {
        "$oid": "68e746428142ea847c758c6a"
      },
      "walletId": {
        "$oid": "68e4a18736109ffa825e55df"
      },
      "userId": {
        "$oid": "68e4a18736109ffa825e55dd"
      },
      "paymentTransactionId": {
        "$oid": "68e746418142ea847c758c65"
      },
      "withdrawalRequestId": null,
      "type": "credit",
      "amount": 40,
      "currency": "usd",
      "status": "completed",
      "referenceFor": "TrainingProgramPurchase",  // it can be  DoctorPatientScheduleBooking | SpecialistPatientScheduleBooking | TrainingProgramPurchase .. so that we can get .. earning categorically .. 
      "referenceId": {
        "$oid": "68e7462f8142ea847c758c60"
      },
      "isDeleted": false,
      "createdAt": {
        "$date": "2025-10-09T05:21:06.255Z"
      }
    }

    ------------------------------------------*/
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const monthStart = startOfMonth(now);
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const yearStart = startOfYear(now);
    const quarterStart = startOfQuarter(now);

    // Base query for completed credit transactions (earnings only)
    const baseQuery = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
      type: TWalletTransactionHistory.credit,
      status: TWalletTransactionStatus.completed,
    };

    console.log("baseQuery ::", baseQuery)

    const [
      totalEarnings,
      todayEarnings,
      thisWeekEarnings,
      thisMonthEarnings,
      lastWeekEarnings,
      lastMonthEarnings,
      thisQuarterEarnings,
      thisYearEarnings,
      totalTransactions,
      currentBalance,
    ] = await Promise.all([
      // Total lifetime earnings
      this.model.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Today's earnings
      this.model.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: todayStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // This week earnings
      this.model.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: weekStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // This month earnings
      this.model.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: monthStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Last week earnings
      this.model.aggregate([
        {
          $match: {
            ...baseQuery,
            createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Last month earnings
      this.model.aggregate([
        {
          $match: {
            ...baseQuery,
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // This quarter earnings
      this.model.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: quarterStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // This year earnings
      this.model.aggregate([
        { $match: { ...baseQuery, createdAt: { $gte: yearStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // Total transactions count
      this.model.countDocuments(baseQuery),

      // Get current wallet balance
      await Wallet.findOne({ 
        userId: new mongoose.Types.ObjectId(userId), 
        isDeleted: false 
      }),
    ]);

    // Calculate growth percentages
    const thisWeekTotal = thisWeekEarnings[0]?.total || 0;
    const lastWeekTotal = lastWeekEarnings[0]?.total || 0;
    const weeklyGrowth =
      lastWeekTotal > 0
        ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
        : thisWeekTotal > 0 ? 100 : 0;

    const thisMonthTotal = thisMonthEarnings[0]?.total || 0;
    const lastMonthTotal = lastMonthEarnings[0]?.total || 0;
    const monthlyGrowth =
      lastMonthTotal > 0
        ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
        : thisMonthTotal > 0 ? 100 : 0;

    // Get month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonth = monthNames[now.getMonth()];
    const lastMonth = monthNames[lastMonthStart.getMonth()];

    // Format date range for last week
    const formatDate = (date: Date) => {
      return `${date.getDate()} ${monthNames[date.getMonth()].slice(0, 3)}`;
    };

    return {
      totalEarnings: {
        amount: totalEarnings[0]?.total || 0,
        count: totalEarnings[0]?.count || 0,
        label: 'Total Program',
      },
      todayEarnings: {
        amount: todayEarnings[0]?.total || 0,
        count: todayEarnings[0]?.count || 0,
        label: 'Today Program',
      },
      thisWeekEarnings: {
        amount: thisWeekTotal,
        count: thisWeekEarnings[0]?.count || 0,
        growth: parseFloat(weeklyGrowth.toFixed(2)),
        label: 'Last week Program',
        dateRange: `${formatDate(weekStart)} - ${formatDate(now)}`,
      },
      thisMonthEarnings: {
        amount: thisMonthTotal,
        count: thisMonthEarnings[0]?.count || 0,
        growth: parseFloat(monthlyGrowth.toFixed(2)),
        label: 'This month Program',
        month: currentMonth,
      },
      lastWeekEarnings: {
        amount: lastWeekTotal,
        count: lastWeekEarnings[0]?.count || 0,
        label: 'Last week Program',
        dateRange: `${formatDate(lastWeekStart)} - ${formatDate(lastWeekEnd)}`,
      },
      lastMonthEarnings: {
        amount: lastMonthTotal,
        count: lastMonthEarnings[0]?.count || 0,
        label: 'Previous month Program',
        month: lastMonth,
      },
      thisQuarterEarnings: {
        amount: thisQuarterEarnings[0]?.total || 0,
        count: thisQuarterEarnings[0]?.count || 0,
        label: 'This Quarter',
      },
      thisYearEarnings: {
        amount: thisYearEarnings[0]?.total || 0,
        count: thisYearEarnings[0]?.count || 0,
        label: 'This Year',
      },
      totalTransactions,
      currentBalance: {
        amount: currentBalance?.balance || 0,
        tokenBalance: currentBalance?.tokenBalance || 0,
      },
    };
  }
}
