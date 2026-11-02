export interface ReferralItem {
  _id: string;
  refereeName?: string;
  refereeEmail?: string;
  refereePhone?: string;
  courseName?: string;
  status: "signed_up" | "enrolled" | "verified" | "rewarded" | "cancelled";
  rewardAmount: number;
  rewardStatus: "pending" | "approved" | "paid";
  payoutRequested?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReferralStats {
  totalInvited: number;
  successfulReferralsCount: number;
  totalEarnings: number;
  pendingRewards: number;
  paidRewards: number;
  rewardPerReferral: number;
  friendDiscount: number;
  tier: string;
  nextTierGoal: number;
}

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  upiId?: string;
  stats: ReferralStats;
  referrals: ReferralItem[];
}

