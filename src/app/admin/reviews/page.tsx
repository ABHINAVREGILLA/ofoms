"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MessageSquare,
  Star,
  CornerDownRight,
  Send,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/restaurants/paradise-biryani-palace");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.restaurant?.reviews || []);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;

    setIsSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      // In a real DB we update review.restaurantReply
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, restaurantReply: text.trim() } : r))
      );
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Guest Satisfaction & Feedback
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Customer Reviews & Responses
          </h1>
          <p className="text-xs text-slate-500">
            Read verified customer ratings and publish official restaurant responses
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No customer reviews yet.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold flex items-center justify-center text-xs">
                    {rev.user?.name ? rev.user.name.charAt(0) : "C"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {rev.user?.name || "Customer"}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-xs font-bold">
                  <span>{rev.rating}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                "{rev.comment}"
              </p>

              {/* Manager Response */}
              {rev.restaurantReply ? (
                <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-900/40 text-xs space-y-1">
                  <div className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Your Response:</span>
                  </div>
                  <p className="text-orange-800 dark:text-orange-200/90 leading-relaxed text-[11px]">
                    {rev.restaurantReply}
                  </p>
                </div>
              ) : (
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a polite response to this customer..."
                      value={replyText[rev.id] || ""}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [rev.id]: e.target.value })
                      }
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      onClick={() => handleReplySubmit(rev.id)}
                      disabled={isSubmitting[rev.id]}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
