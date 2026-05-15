/**
 * 画廊/发现页状态管理
 */
import type { ResourceResponse } from "@/services/aurakey";
import { defineStore } from "pinia";

export interface GalleryItem {
  id: string;
  thumb_url: string;
  aspect_ratio: string;
  author: {
    user_id: string;
    nickname?: string | null;
    avatar?: string | null;
  };
  like_count: number;
  is_liked: boolean;
  view_count: number;
}

export interface GalleryDetail extends GalleryItem {
  resource: ResourceResponse;
  prompt: string;
  model_name: string;
}

export const useGalleryStore = defineStore("gallery", {
  state: () => ({
    items: [] as GalleryItem[],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    loading: false,
    selectedItem: null as GalleryDetail | null,
  }),
  actions: {
    setItems(items: GalleryItem[]) {
      this.items = items;
    },
    appendItems(items: GalleryItem[]) {
      this.items.push(...items);
    },
    setSelectedItem(item: GalleryDetail | null) {
      this.selectedItem = item;
    },
    updateLikeStatus(id: string, isLiked: boolean, likeCount: number) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        item.is_liked = isLiked;
        item.like_count = likeCount;
      }
      if (this.selectedItem && this.selectedItem.id === id) {
        this.selectedItem.is_liked = isLiked;
        this.selectedItem.like_count = likeCount;
      }
    },
    reset() {
      this.items = [];
      this.currentPage = 1;
      this.hasMore = true;
    },
  },
});
