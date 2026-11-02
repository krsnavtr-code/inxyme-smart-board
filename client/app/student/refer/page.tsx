"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ReferralData, ReferralItem } from "@/types/referral";
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Wallet,
  Send,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Award,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  QrCode,
  DollarSign
} from "lucide-react";

export default function StudentReferPage() {
  const { user } = useAuth();

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Payout form state
  const [upiIdInput, setUpiIdInput] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState<string | null>(null);

  // Invite friend form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);

  // FAQ accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const fetchReferralData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (user.id) params.set("userId", user.id);
      if (user.email) params.set("email", user.email);

      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/student/referrals?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load referral data (HTTP ${res.status})`);
      }

      const resData = await res.json();
      setData(resData);
      if (resData.upiId) {
        setUpiIdInput(resData.upiId);
      }
    } catch (err: any) {
      console.error("Error loading referrals:", err);
      setError(err.message || "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  const copyToClipboard = (text: string, type: "code" | "link") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const referralCode = data?.referralCode || `INX-${(user?.name || "STUDENT").slice(0, 4).toUpperCase()}88`;
  const referralLink =
    data?.referralLink || `https://www.inxyme.com/courses?ref=${referralCode}`;

  // WhatsApp share link
  const whatsappShareText = encodeURIComponent(
    `🔥 Hey! I am learning at Inxyme LMS. Use my referral code *${referralCode}* to get an instant 15% discount on all industry certification programs & live cohorts!\n\nEnroll with my link here: ${referralLink}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappShareText}`;

  // Telegram share link
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    referralLink
  )}&text=${encodeURIComponent(
    `Join Inxyme LMS courses with 15% discount using referral code ${referralCode}`
  )}`;

  // Email share link
  const emailSubject = encodeURIComponent("15% Discount on Inxyme Certification Courses");
  const emailBody = encodeURIComponent(
    `Hey,\n\nI wanted to share this with you! Inxyme offers comprehensive certification programs with live classes, hands-on projects, and mentorship.\n\nUse my referral code "${referralCode}" or click the link below to get an instant 15% discount on your enrollment:\n${referralLink}\n\nHappy Learning!`
  );
  const mailtoUrl = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  // Handle payout submission
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiIdInput.trim()) return;

    setSubmittingPayout(true);
    setPayoutSuccessMessage(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/student/referrals", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "payout",
          userId: user?.id,
          upiId: upiIdInput.trim(),
          notes: payoutNotes,
        }),
      });

      const resData = await res.json();
      setPayoutSuccessMessage(resData.message || "Payout request submitted successfully!");
      setTimeout(() => {
        setIsPayoutModalOpen(false);
        setPayoutSuccessMessage(null);
        fetchReferralData();
      }, 2000);
    } catch (err: any) {
      console.error("Payout submission error:", err);
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Handle invite friend submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() && !inviteEmail.trim()) return;

    setSubmittingInvite(true);
    setInviteSuccessMessage(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("inxyme_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/student/referrals", {
        method: "POST",
        headers,
        body: JSON.stringify({
          action: "invite",
          userId: user?.id,
          refereeName: inviteName.trim(),
          refereeEmail: inviteEmail.trim(),
          refereePhone: invitePhone.trim(),
        }),
      });

      const resData = await res.json();
      setInviteSuccessMessage(resData.message || "Invitation recorded successfully!");
      setInviteName("");
      setInviteEmail("");
      setInvitePhone("");
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccessMessage(null);
        fetchReferralData();
      }, 1500);
    } catch (err: any) {
      console.error("Invite submission error:", err);
    } finally {
      setSubmittingInvite(false);
    }
  };

  const faqs = [
    {
      q: "How does the Refer and Earn program work?",
      a: "Share your unique referral code or link with friends, classmates, or on social media. When your friend enrolls in any course on Inxyme using your code, they get an instant 15% discount on course fees, and you earn a flat ₹1,000 cash reward!",
    },
    {
      q: "When and how do I receive my referral payout?",
      a: "Once your referred student completes their enrollment, the reward is approved. You can request a withdrawal directly to your UPI ID (Google Pay, PhonePe, Paytm, or BHIM) or Bank Account with a 24-48 hour settlement timeline.",
    },
    {
      q: "Is there any limit to how many friends I can refer?",
      a: "No! There is absolutely no limit. The more students you refer, the more cash you earn. As you reach 4+ referrals, you level up to Silver Ambassador (earning ₹1,500 per referral), and at 10+ referrals, you become a Platinum Ambassador (earning ₹2,000 per referral)!",
    },
    {
      q: "What discount does my referred friend get?",
      a: "Your friend gets an exclusive 15% to 25% discount on their total course fees when they apply your referral code at checkout.",
    },
    {
      q: "How can I track the status of my referred friends?",
      a: "All your invites and referred students are listed in the 'Referrals History & Status' table below, where you can see real-time updates: 'Signed Up', 'Enrolled', 'Reward Approved', or 'Paid'.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 animate-bounce" />
                <span>Inxyme Student Ambassador Program</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Refer Friends &amp; Earn{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  ₹1,000 Cash
                </span>{" "}
                Per Enrollment
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Empower your peers to level up their tech careers. When friends join Inxyme using your referral code, they receive an exclusive <span className="text-emerald-400 font-bold">15% discount</span>, and you earn guaranteed cash rewards directly to your UPI!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Invite a Friend</span>
              </button>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs sm:text-sm border border-slate-700 shadow-lg transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Withdraw Payout</span>
              </button>
            </div>
          </div>
        </section>

        {/* METRICS & ANALYTICS OVERVIEW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Earnings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Earnings</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              ₹{(data?.stats.totalEarnings || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Available for UPI withdrawal</span>
            </p>
          </div>

          {/* Successful Referrals */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Enrolled Friends</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {data?.stats.successfulReferralsCount || 0}
            </p>
            <p className="text-[11px] text-slate-400">
              Total Invites Sent: {data?.stats.totalInvited || 0}
            </p>
          </div>

          {/* Pending Rewards */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Pending Approvals</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              ₹{(data?.stats.pendingRewards || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-400/90 font-medium">
              Verifying active cohort admissions
            </p>
          </div>

          {/* Current Tier */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Ambassador Tier</span>
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white truncate">
              {data?.stats.tier || "Bronze"}
            </p>
            <p className="text-[11px] text-purple-300 font-medium">
              Earning ₹{data?.stats.rewardPerReferral || 1000} / referral
            </p>
          </div>
        </section>

        {/* SHARE & REFERRAL HUB */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <span>Your Referral Code &amp; Instant Share Link</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Share with classmates, friends on WhatsApp groups, or social channels
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                15% Discount For Friends
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Referral Code Box (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Personal Referral Code
                </span>
                <div className="mt-2 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                  <span className="text-lg font-mono font-black text-emerald-400 tracking-wider">
                    {referralCode}
                  </span>
                  <button
                    onClick={() => copyToClipboard(referralCode, "code")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
                    title="Copy Referral Code"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Friends enter this code during course checkout or enrollment registration.
              </p>
            </div>

            {/* Referral Link Box (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Referral URL
                </span>
                <div className="mt-2 flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-transparent text-xs font-mono text-slate-300 focus:outline-none truncate"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink, "link")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Channels 1-Click Share */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-semibold text-slate-400">Share via:</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs border border-emerald-800/50 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900 text-sky-300 font-semibold text-xs border border-sky-800/50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Telegram</span>
                </a>

                <a
                  href={mailtoUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (3 STEPS) */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">How To Earn With Inxyme</h2>
            <p className="text-xs text-slate-400">
              Zero complicated terms. Guaranteed rewards for helping students discover high-growth tech programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Invite Friends &amp; Peers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send your unique referral link or code to friends, college batchmates, and tech study groups.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Friend Gets 15% OFF</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your friend gets an instant 15% fee waiver on any course enrollment and gets placed into an active cohort.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 relative space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-white">Get ₹1,000 in Your UPI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You receive ₹1,000 cash per student directly in your bank account / UPI within 24-48 hours.
              </p>
            </div>
          </div>
        </section>

        {/* REFERRAL TIERS & AMBASSADOR PERKS */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Ambassador Tiers &amp; Milestone Perks
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Level up your referral rewards as more students enroll through your link
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Current Tier: {data?.stats.tier || "Bronze"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bronze */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 uppercase">Bronze Tier</span>
                <span className="text-[11px] text-slate-400">1 - 3 Referrals</span>
              </div>
              <p className="text-2xl font-black text-white">₹1,000 <span className="text-xs font-normal text-slate-400">/ referral</span></p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>15% friend fee discount</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Direct UPI payouts</span>
                </li>
              </ul>
            </div>

            {/* Silver */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-indigo-500/40 relative space-y-3 shadow-lg shadow-indigo-500/5">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase">
                Popular
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase">Silver Ambassador</span>
                <span className="text-[11px] text-slate-400">4 - 9 Referrals</span>
              </div>
              <p className="text-2xl font-black text-white">₹1,500 <span className="text-xs font-normal text-slate-400">/ referral</span></p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>20% friend fee discount</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-on-1 Senior Tech Mock Interview</span>
                </li>
              </ul>
            </div>

            {/* Platinum */}
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-purple-500/40 space-y-3 shadow-lg shadow-purple-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase">Platinum Ambassador</span>
                <span className="text-[11px] text-slate-400">10+ Referrals</span>
              </div>
              <p className="text-2xl font-black text-white">₹2,000 <span className="text-xs font-normal text-slate-400">/ referral</span></p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>25% friend fee discount</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Pro Course Certification</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Official Inxyme Ambassador Badge</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* REFERRALS HISTORY & STATUS TABLE */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Referrals History &amp; Status</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time tracking of students who enrolled through your link
              </p>
            </div>

            <button
              onClick={fetchReferralData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Loading your referrals...</span>
            </div>
          ) : !data?.referrals || data.referrals.length === 0 ? (
            <div className="p-10 text-center bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No Referrals Recorded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start sharing your unique referral link with your classmates and earn ₹1,000 on their first enrollment!
              </p>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send First Invite</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Program / Course</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Cash Reward</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.referrals.map((r: ReferralItem, idx: number) => {
                    const isPaid = r.rewardStatus === "paid";
                    const isApproved = r.rewardStatus === "approved";

                    return (
                      <tr key={r._id || idx} className="hover:bg-slate-850/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {r.refereeName || "Prospective Student"}
                          {r.refereeEmail && (
                            <span className="block text-[10px] text-slate-500 font-normal">
                              {r.refereeEmail}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {r.courseName || "Inxyme Certification Program"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isApproved
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isPaid ? "Paid to UPI" : isApproved ? "Approved" : "Under Review"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                          +₹{r.rewardAmount || 1000}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-400">Everything you need to know about the referral program</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-200">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* PAYOUT WITHDRAWAL MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Request Referral Payout</h3>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayoutSubmit} className="p-6 space-y-4">
              {payoutSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{payoutSuccessMessage}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(data?.stats.totalEarnings || 0).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Payouts are settled directly to this UPI address within 24-48 business hours.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="e.g. Account holder name or remarks..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingPayout ? "Submitting..." : "Submit Payout Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE FRIEND MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Invite a Classmate / Friend</h3>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              {inviteSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{inviteSuccessMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Friend's Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Friend's Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">
                  Your code <span className="text-emerald-400">{referralCode}</span> will be attached.
                </p>
                <p>When your friend registers and enrolls, ₹1,000 will be credited to your account!</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingInvite ? "Recording..." : "Record & Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

