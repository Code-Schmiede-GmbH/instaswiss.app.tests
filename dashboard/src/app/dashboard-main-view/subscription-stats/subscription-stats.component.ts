import { Component, Input, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import {
  HikeWithCreator,
  getApiKey,
  fetchJson,
  SUPABASE_URL,
} from '../../tests/logic/test-utils';

@Component({
  selector: 'app-subscription-stats',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    FormsModule,
  ],
  templateUrl: './subscription-stats.component.html',
  styleUrls: ['./subscription-stats.component.scss'],
})
export class SubscriptionStatsComponent implements OnInit {
  @Input() hikes: HikeWithCreator[] = [];

  selectedView: 'lifetime' | 'yearly' | 'quarterly' = 'lifetime';
  lifetimeSubscriptionPot: number = 0;
  yearlySubscriptionCount: number = 0;
  quarterlySubscriptionCount: number = 0;

  private _yearlySubscriptionPrice: number = 39;
  get yearlySubscriptionPrice(): number {
    return this._yearlySubscriptionPrice;
  }
  set yearlySubscriptionPrice(value: number) {
    this._yearlySubscriptionPrice = value;
    this.invalidateYearlySubscriptionStatsCache();
  }

  private _yearlySubscriptionCreatorShare: number = 100;
  get yearlySubscriptionCreatorShare(): number {
    return this._yearlySubscriptionCreatorShare;
  }
  set yearlySubscriptionCreatorShare(value: number) {
    this._yearlySubscriptionCreatorShare = value;
    this.invalidateYearlySubscriptionStatsCache();
  }

  private _yearlySubscriptionStartDate: string = '';
  get yearlySubscriptionStartDate(): string {
    return this._yearlySubscriptionStartDate;
  }
  set yearlySubscriptionStartDate(value: string) {
    this._yearlySubscriptionStartDate = value;
    this.invalidateYearlySubscriptionStatsCache();
  }

  private _yearlySubscriptionEndDate: string = '';
  get yearlySubscriptionEndDate(): string {
    return this._yearlySubscriptionEndDate;
  }
  set yearlySubscriptionEndDate(value: string) {
    this._yearlySubscriptionEndDate = value;
    this.invalidateYearlySubscriptionStatsCache();
  }

  private _yearlySubscriptions: Array<{ id: string; created_at: string }> = [];
  get yearlySubscriptions(): Array<{ id: string; created_at: string }> {
    return this._yearlySubscriptions;
  }
  set yearlySubscriptions(value: Array<{ id: string; created_at: string }>) {
    this._yearlySubscriptions = value;
    this.invalidateYearlySubscriptionStatsCache();
  }

  private _quarterlySubscriptionPrice: number = 15;
  get quarterlySubscriptionPrice(): number {
    return this._quarterlySubscriptionPrice;
  }
  set quarterlySubscriptionPrice(value: number) {
    this._quarterlySubscriptionPrice = value;
    this.invalidateQuarterlySubscriptionStatsCache();
  }

  private _quarterlySubscriptionCreatorShare: number = 100;
  get quarterlySubscriptionCreatorShare(): number {
    return this._quarterlySubscriptionCreatorShare;
  }
  set quarterlySubscriptionCreatorShare(value: number) {
    this._quarterlySubscriptionCreatorShare = value;
    this.invalidateQuarterlySubscriptionStatsCache();
  }

  private _quarterlySubscriptionStartDate: string = '';
  get quarterlySubscriptionStartDate(): string {
    return this._quarterlySubscriptionStartDate;
  }
  set quarterlySubscriptionStartDate(value: string) {
    this._quarterlySubscriptionStartDate = value;
    this.invalidateQuarterlySubscriptionStatsCache();
  }

  private _quarterlySubscriptionEndDate: string = '';
  get quarterlySubscriptionEndDate(): string {
    return this._quarterlySubscriptionEndDate;
  }
  set quarterlySubscriptionEndDate(value: string) {
    this._quarterlySubscriptionEndDate = value;
    this.invalidateQuarterlySubscriptionStatsCache();
  }

  private _quarterlySubscriptions: Array<{ id: string; created_at: string }> = [];
  get quarterlySubscriptions(): Array<{ id: string; created_at: string }> {
    return this._quarterlySubscriptions;
  }
  set quarterlySubscriptions(value: Array<{ id: string; created_at: string }>) {
    this._quarterlySubscriptions = value;
    this.invalidateQuarterlySubscriptionStatsCache();
  }

  // Cache for yearly subscription stats
  private _yearlySubscriptionStatsCache: Array<{
    name: string;
    count: number;
    percent: number;
    potShare: number;
    averageHikeShare: number;
  }> | null = null;
  private _yearlySubscriptionStatsDependencies: {
    hikesLength: number;
    yearlySubscriptionsLength: number;
    yearlySubscriptionPrice: number;
    yearlySubscriptionCreatorShare: number;
    yearlySubscriptionStartDate: string;
    yearlySubscriptionEndDate: string;
    hikesHash: string;
    subscriptionsHash: string;
  } | null = null;

  // Cache for quarterly subscription stats
  private _quarterlySubscriptionStatsCache: Array<{
    name: string;
    count: number;
    percent: number;
    potShare: number;
    averageHikeShare: number;
  }> | null = null;
  private _quarterlySubscriptionStatsDependencies: {
    hikesLength: number;
    quarterlySubscriptionsLength: number;
    quarterlySubscriptionPrice: number;
    quarterlySubscriptionCreatorShare: number;
    quarterlySubscriptionStartDate: string;
    quarterlySubscriptionEndDate: string;
    hikesHash: string;
    subscriptionsHash: string;
  } | null = null;

  ngOnInit() {
    this.fetchYearlySubscriptionCount();
    this.fetchQuarterlySubscriptionCount();
  }

  private createHikesHash(hikes: HikeWithCreator[]): string {
    return hikes
      .map((h) => `${h.id}-${h.date_created}-${h.creator?.id || h.creator_id}`)
      .join('|');
  }

  private createSubscriptionsHash(
    subscriptions: Array<{ id: string; created_at: string }>,
  ): string {
    return subscriptions.map((s) => `${s.id}-${s.created_at}`).join('|');
  }

  private invalidateYearlySubscriptionStatsCache() {
    this._yearlySubscriptionStatsCache = null;
    this._yearlySubscriptionStatsDependencies = null;
  }

  private invalidateQuarterlySubscriptionStatsCache() {
    this._quarterlySubscriptionStatsCache = null;
    this._quarterlySubscriptionStatsDependencies = null;
  }

  private hasYearlySubscriptionStatsDependenciesChanged(): boolean {
    if (!this._yearlySubscriptionStatsDependencies) return true;

    const currentDeps = {
      hikesLength: this.hikes?.length || 0,
      yearlySubscriptionsLength: this.yearlySubscriptions?.length || 0,
      yearlySubscriptionPrice: this.yearlySubscriptionPrice,
      yearlySubscriptionCreatorShare: this.yearlySubscriptionCreatorShare,
      yearlySubscriptionStartDate: this.yearlySubscriptionStartDate,
      yearlySubscriptionEndDate: this.yearlySubscriptionEndDate,
      hikesHash: this.createHikesHash(this.hikes || []),
      subscriptionsHash: this.createSubscriptionsHash(
        this.yearlySubscriptions || [],
      ),
    };

    return (
      this._yearlySubscriptionStatsDependencies.hikesLength !==
        currentDeps.hikesLength ||
      this._yearlySubscriptionStatsDependencies.yearlySubscriptionsLength !==
        currentDeps.yearlySubscriptionsLength ||
      this._yearlySubscriptionStatsDependencies.yearlySubscriptionPrice !==
        currentDeps.yearlySubscriptionPrice ||
      this._yearlySubscriptionStatsDependencies
        .yearlySubscriptionCreatorShare !==
        currentDeps.yearlySubscriptionCreatorShare ||
      this._yearlySubscriptionStatsDependencies.yearlySubscriptionStartDate !==
        currentDeps.yearlySubscriptionStartDate ||
      this._yearlySubscriptionStatsDependencies.yearlySubscriptionEndDate !==
        currentDeps.yearlySubscriptionEndDate ||
      this._yearlySubscriptionStatsDependencies.hikesHash !==
        currentDeps.hikesHash ||
      this._yearlySubscriptionStatsDependencies.subscriptionsHash !==
        currentDeps.subscriptionsHash
    );
  }

  private _updateYearlySubscriptionStatsDependencies() {
    this._yearlySubscriptionStatsDependencies = {
      hikesLength: this.hikes?.length || 0,
      yearlySubscriptionsLength: this.yearlySubscriptions?.length || 0,
      yearlySubscriptionPrice: this.yearlySubscriptionPrice,
      yearlySubscriptionCreatorShare: this.yearlySubscriptionCreatorShare,
      yearlySubscriptionStartDate: this.yearlySubscriptionStartDate,
      yearlySubscriptionEndDate: this.yearlySubscriptionEndDate,
      hikesHash: this.createHikesHash(this.hikes || []),
      subscriptionsHash: this.createSubscriptionsHash(
        this.yearlySubscriptions || [],
      ),
    };
  }

  private hasQuarterlySubscriptionStatsDependenciesChanged(): boolean {
    if (!this._quarterlySubscriptionStatsDependencies) return true;

    const currentDeps = {
      hikesLength: this.hikes?.length || 0,
      quarterlySubscriptionsLength: this.quarterlySubscriptions?.length || 0,
      quarterlySubscriptionPrice: this.quarterlySubscriptionPrice,
      quarterlySubscriptionCreatorShare: this.quarterlySubscriptionCreatorShare,
      quarterlySubscriptionStartDate: this.quarterlySubscriptionStartDate,
      quarterlySubscriptionEndDate: this.quarterlySubscriptionEndDate,
      hikesHash: this.createHikesHash(this.hikes || []),
      subscriptionsHash: this.createSubscriptionsHash(
        this.quarterlySubscriptions || [],
      ),
    };

    return (
      this._quarterlySubscriptionStatsDependencies.hikesLength !==
        currentDeps.hikesLength ||
      this._quarterlySubscriptionStatsDependencies.quarterlySubscriptionsLength !==
        currentDeps.quarterlySubscriptionsLength ||
      this._quarterlySubscriptionStatsDependencies.quarterlySubscriptionPrice !==
        currentDeps.quarterlySubscriptionPrice ||
      this._quarterlySubscriptionStatsDependencies
        .quarterlySubscriptionCreatorShare !==
        currentDeps.quarterlySubscriptionCreatorShare ||
      this._quarterlySubscriptionStatsDependencies.quarterlySubscriptionStartDate !==
        currentDeps.quarterlySubscriptionStartDate ||
      this._quarterlySubscriptionStatsDependencies.quarterlySubscriptionEndDate !==
        currentDeps.quarterlySubscriptionEndDate ||
      this._quarterlySubscriptionStatsDependencies.hikesHash !==
        currentDeps.hikesHash ||
      this._quarterlySubscriptionStatsDependencies.subscriptionsHash !==
        currentDeps.subscriptionsHash
    );
  }

  private _updateQuarterlySubscriptionStatsDependencies() {
    this._quarterlySubscriptionStatsDependencies = {
      hikesLength: this.hikes?.length || 0,
      quarterlySubscriptionsLength: this.quarterlySubscriptions?.length || 0,
      quarterlySubscriptionPrice: this.quarterlySubscriptionPrice,
      quarterlySubscriptionCreatorShare: this.quarterlySubscriptionCreatorShare,
      quarterlySubscriptionStartDate: this.quarterlySubscriptionStartDate,
      quarterlySubscriptionEndDate: this.quarterlySubscriptionEndDate,
      hikesHash: this.createHikesHash(this.hikes || []),
      subscriptionsHash: this.createSubscriptionsHash(
        this.quarterlySubscriptions || [],
      ),
    };
  }

  async fetchYearlySubscriptionCount() {
    try {
      const supabaseKey = getApiKey();
      const { data } = await fetchJson(
        `${SUPABASE_URL}/rest/v1/subscriptions?select=id,created_at&subscription_type=eq.yearly`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );
      this.yearlySubscriptionCount = data.length;
      this.yearlySubscriptions = data;
      this.invalidateYearlySubscriptionStatsCache();
    } catch (error) {
      console.error('Error fetching yearly subscription count:', error);
      this.yearlySubscriptionCount = 0;
      this.yearlySubscriptions = [];
      this.invalidateYearlySubscriptionStatsCache();
    }
  }

  async fetchQuarterlySubscriptionCount() {
    try {
      const supabaseKey = getApiKey();
      const { data } = await fetchJson(
        `${SUPABASE_URL}/rest/v1/subscriptions?select=id,created_at&subscription_type=eq.quarterly`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        },
      );
      this.quarterlySubscriptionCount = data.length;
      this.quarterlySubscriptions = data;
      this.invalidateQuarterlySubscriptionStatsCache();
    } catch (error) {
      console.error('Error fetching quarterly subscription count:', error);
      this.quarterlySubscriptionCount = 0;
      this.quarterlySubscriptions = [];
      this.invalidateQuarterlySubscriptionStatsCache();
    }
  }

  get lifetimeSubscriptionStats(): Array<{
    name: string;
    count: number;
    percent: number;
    potShare: number;
  }> {
    if (!this.hikes || this.hikes.length === 0) return [];

    // Filter hikes created before July 24, 2025
    const lifetimeCutoff = new Date(2025, 6, 24);
    const lifetimeHikes = this.hikes.filter((hike) => {
      const hikeDate = new Date(hike.date_created);
      return hikeDate < lifetimeCutoff;
    });

    if (lifetimeHikes.length === 0) return [];

    const total = lifetimeHikes.length;
    const map = new Map<string, { count: number; creator: any }>();

    for (const h of lifetimeHikes) {
      const key = h.creator?.id || h.creator_id || 'unbekannt';
      if (!map.has(key)) {
        map.set(key, { count: 0, creator: h.creator });
      }
      map.get(key)!.count++;
    }

    return Array.from(map.values())
      .map(({ count, creator }) => {
        const name =
          creator?.first_name || creator?.last_name
            ? `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim()
            : creator?.email || 'unbekannt';
        const percent = (count / total) * 100;
        const potShare = (this.lifetimeSubscriptionPot * percent) / 100;
        return {
          name,
          count,
          percent: Math.round(percent),
          potShare: Math.round(potShare * 100) / 100, // Round to 2 decimal places
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  get yearlySubscriptionStats(): Array<{
    name: string;
    count: number;
    percent: number;
    potShare: number;
    averageHikeShare: number;
  }> {
    // Check if cache is valid
    if (
      this._yearlySubscriptionStatsCache &&
      !this.hasYearlySubscriptionStatsDependenciesChanged()
    ) {
      return this._yearlySubscriptionStatsCache;
    }

    // Early return for invalid data
    if (
      !this.hikes ||
      this.hikes.length === 0 ||
      this.yearlySubscriptions.length === 0 ||
      this.yearlySubscriptionPrice === 0
    ) {
      this._yearlySubscriptionStatsCache = [];
      this._updateYearlySubscriptionStatsDependencies();
      return [];
    }

    // Create a map to track total revenue and hike shares per creator
    const creatorRevenueMap = new Map<
      string,
      {
        name: string;
        totalRevenue: number;
        totalHikes: number;
        hikeShares: number[]; // Track individual hike share percentages for each subscription
      }
    >();

    // Filter subscriptions by date range if specified
    let filteredSubscriptions = this.yearlySubscriptions;
    if (this.yearlySubscriptionStartDate || this.yearlySubscriptionEndDate) {
      filteredSubscriptions = this.yearlySubscriptions.filter(
        (subscription) => {
          const subscriptionDate = new Date(subscription.created_at);
          const startDate = this.yearlySubscriptionStartDate
            ? new Date(this.yearlySubscriptionStartDate)
            : null;
          const endDate = this.yearlySubscriptionEndDate
            ? new Date(this.yearlySubscriptionEndDate)
            : null;

          if (startDate && subscriptionDate < startDate) return false;
          if (endDate && subscriptionDate > endDate) return false;
          return true;
        },
      );
    }

    // Process each yearly subscription
    for (const subscription of filteredSubscriptions) {
      const subscriptionDate = new Date(subscription.created_at);

      // Find hikes that were published before or on the subscription date
      const hikesAtSubscriptionTime = this.hikes.filter((hike) => {
        const hikeDate = new Date(hike.date_created);
        return hikeDate <= subscriptionDate;
      });

      if (hikesAtSubscriptionTime.length === 0) continue;

      // Calculate creator shares for this subscription
      const creatorShares = new Map<string, { count: number; creator: any }>();

      for (const hike of hikesAtSubscriptionTime) {
        const key = hike.creator?.id || hike.creator_id || 'unbekannt';
        if (!creatorShares.has(key)) {
          creatorShares.set(key, { count: 0, creator: hike.creator });
        }
        creatorShares.get(key)!.count++;
      }

      // Distribute the subscription price among creators based on their hike share
      const totalHikesAtTime = hikesAtSubscriptionTime.length;
      const creatorShareAmount =
        (this.yearlySubscriptionPrice * this.yearlySubscriptionCreatorShare) /
        100;

      for (const [creatorKey, { count, creator }] of creatorShares) {
        const share = count / totalHikesAtTime;
        const revenue = creatorShareAmount * share;

        if (!creatorRevenueMap.has(creatorKey)) {
          const name =
            creator?.first_name || creator?.last_name
              ? `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim()
              : creator?.email || 'unbekannt';
          creatorRevenueMap.set(creatorKey, {
            name,
            totalRevenue: 0,
            totalHikes: 0,
            hikeShares: [],
          });
        }

        const creatorData = creatorRevenueMap.get(creatorKey)!;
        creatorData.totalRevenue += revenue;
        creatorData.totalHikes += count;
        creatorData.hikeShares.push(share * 100); // Store as percentage
      }
    }

    // Convert to array and calculate percentages
    const totalRevenueSum = Array.from(creatorRevenueMap.values()).reduce(
      (sum, data) => sum + data.totalRevenue,
      0,
    );

    const result = Array.from(creatorRevenueMap.values())
      .map(({ name, totalRevenue, totalHikes, hikeShares }) => {
        const percent =
          totalRevenueSum > 0 ? (totalRevenue / totalRevenueSum) * 100 : 0;
        const averageHikeShare =
          hikeShares.length > 0
            ? hikeShares.reduce((sum, share) => sum + share, 0) /
              hikeShares.length
            : 0;
        return {
          name,
          count: totalHikes,
          percent: Math.round(percent),
          potShare: Math.round(totalRevenue * 100) / 100,
          averageHikeShare: Math.round(averageHikeShare * 10) / 10, // Round to 1 decimal place
        };
      })
      .sort((a, b) => b.potShare - a.potShare);

    // Cache the result
    this._yearlySubscriptionStatsCache = result;
    this._updateYearlySubscriptionStatsDependencies();

    return result;
  }

  get quarterlySubscriptionStats(): Array<{
    name: string;
    count: number;
    percent: number;
    potShare: number;
    averageHikeShare: number;
  }> {
    // Check if cache is valid
    if (
      this._quarterlySubscriptionStatsCache &&
      !this.hasQuarterlySubscriptionStatsDependenciesChanged()
    ) {
      return this._quarterlySubscriptionStatsCache;
    }

    // Early return for invalid data
    if (
      !this.hikes ||
      this.hikes.length === 0 ||
      this.quarterlySubscriptions.length === 0 ||
      this.quarterlySubscriptionPrice === 0
    ) {
      this._quarterlySubscriptionStatsCache = [];
      this._updateQuarterlySubscriptionStatsDependencies();
      return [];
    }

    // Create a map to track total revenue and hike shares per creator
    const creatorRevenueMap = new Map<
      string,
      {
        name: string;
        totalRevenue: number;
        totalHikes: number;
        hikeShares: number[]; // Track individual hike share percentages for each subscription
      }
    >();

    // Filter subscriptions by date range if specified
    let filteredSubscriptions = this.quarterlySubscriptions;
    if (this.quarterlySubscriptionStartDate || this.quarterlySubscriptionEndDate) {
      filteredSubscriptions = this.quarterlySubscriptions.filter(
        (subscription) => {
          const subscriptionDate = new Date(subscription.created_at);
          const startDate = this.quarterlySubscriptionStartDate
            ? new Date(this.quarterlySubscriptionStartDate)
            : null;
          const endDate = this.quarterlySubscriptionEndDate
            ? new Date(this.quarterlySubscriptionEndDate)
            : null;

          if (startDate && subscriptionDate < startDate) return false;
          if (endDate && subscriptionDate > endDate) return false;
          return true;
        },
      );
    }

    // Process each quarterly subscription
    for (const subscription of filteredSubscriptions) {
      const subscriptionDate = new Date(subscription.created_at);

      // Find hikes that were published before or on the subscription date
      const hikesAtSubscriptionTime = this.hikes.filter((hike) => {
        const hikeDate = new Date(hike.date_created);
        return hikeDate <= subscriptionDate;
      });

      if (hikesAtSubscriptionTime.length === 0) continue;

      // Calculate creator shares for this subscription
      const creatorShares = new Map<string, { count: number; creator: any }>();

      for (const hike of hikesAtSubscriptionTime) {
        const key = hike.creator?.id || hike.creator_id || 'unbekannt';
        if (!creatorShares.has(key)) {
          creatorShares.set(key, { count: 0, creator: hike.creator });
        }
        creatorShares.get(key)!.count++;
      }

      // Distribute the subscription price among creators based on their hike share
      const totalHikesAtTime = hikesAtSubscriptionTime.length;
      const creatorShareAmount =
        (this.quarterlySubscriptionPrice * this.quarterlySubscriptionCreatorShare) /
        100;

      for (const [creatorKey, { count, creator }] of creatorShares) {
        const share = count / totalHikesAtTime;
        const revenue = creatorShareAmount * share;

        if (!creatorRevenueMap.has(creatorKey)) {
          const name =
            creator?.first_name || creator?.last_name
              ? `${creator?.first_name || ''} ${creator?.last_name || ''}`.trim()
              : creator?.email || 'unbekannt';
          creatorRevenueMap.set(creatorKey, {
            name,
            totalRevenue: 0,
            totalHikes: 0,
            hikeShares: [],
          });
        }

        const creatorData = creatorRevenueMap.get(creatorKey)!;
        creatorData.totalRevenue += revenue;
        creatorData.totalHikes += count;
        creatorData.hikeShares.push(share * 100); // Store as percentage
      }
    }

    // Convert to array and calculate percentages
    const totalRevenueSum = Array.from(creatorRevenueMap.values()).reduce(
      (sum, data) => sum + data.totalRevenue,
      0,
    );

    const result = Array.from(creatorRevenueMap.values())
      .map(({ name, totalRevenue, totalHikes, hikeShares }) => {
        const percent =
          totalRevenueSum > 0 ? (totalRevenue / totalRevenueSum) * 100 : 0;
        const averageHikeShare =
          hikeShares.length > 0
            ? hikeShares.reduce((sum, share) => sum + share, 0) /
              hikeShares.length
            : 0;
        return {
          name,
          count: totalHikes,
          percent: Math.round(percent),
          potShare: Math.round(totalRevenue * 100) / 100,
          averageHikeShare: Math.round(averageHikeShare * 10) / 10, // Round to 1 decimal place
        };
      })
      .sort((a, b) => b.potShare - a.potShare);

    // Cache the result
    this._quarterlySubscriptionStatsCache = result;
    this._updateQuarterlySubscriptionStatsDependencies();

    return result;
  }

  get lifetimeSubscriptionTotal() {
    return this.lifetimeSubscriptionStats.reduce(
      (sum, stat) => sum + stat.count,
      0,
    );
  }

  get yearlySubscriptionTotal() {
    if (this.yearlySubscriptionStartDate || this.yearlySubscriptionEndDate) {
      const startDate = this.yearlySubscriptionStartDate
        ? new Date(this.yearlySubscriptionStartDate)
        : null;
      const endDate = this.yearlySubscriptionEndDate
        ? new Date(this.yearlySubscriptionEndDate)
        : null;

      return this.yearlySubscriptions.filter((subscription) => {
        const subscriptionDate = new Date(subscription.created_at);
        if (startDate && subscriptionDate < startDate) return false;
        if (endDate && subscriptionDate > endDate) return false;
        return true;
      }).length;
    }
    return this.yearlySubscriptionCount;
  }

  get yearlySubscriptionTotalRevenue() {
    return this.yearlySubscriptionTotal * this.yearlySubscriptionPrice;
  }

  get quarterlySubscriptionTotal() {
    if (this.quarterlySubscriptionStartDate || this.quarterlySubscriptionEndDate) {
      const startDate = this.quarterlySubscriptionStartDate
        ? new Date(this.quarterlySubscriptionStartDate)
        : null;
      const endDate = this.quarterlySubscriptionEndDate
        ? new Date(this.quarterlySubscriptionEndDate)
        : null;

      return this.quarterlySubscriptions.filter((subscription) => {
        const subscriptionDate = new Date(subscription.created_at);
        if (startDate && subscriptionDate < startDate) return false;
        if (endDate && subscriptionDate > endDate) return false;
        return true;
      }).length;
    }
    return this.quarterlySubscriptionCount;
  }

  get quarterlySubscriptionTotalRevenue() {
    return this.quarterlySubscriptionTotal * this.quarterlySubscriptionPrice;
  }

  onViewChange(view: string) {
    this.selectedView = view as 'lifetime' | 'yearly' | 'quarterly';
  }
}
