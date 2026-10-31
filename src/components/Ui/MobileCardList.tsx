"use client";

import { CardListSkeleton } from "./Skeleton";

type Props<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyText?: string;
  /** true = tampilkan kerangka kartu (data belum datang). */
  loading?: boolean;
};

export default function MobileCardList<T>({
  data,
  renderItem,
  emptyText = "Tidak ada data",
  loading = false,
}: Props<T>) {
  if (loading) {
    return (
      <div className="md:hidden space-y-3">
        <CardListSkeleton />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="md:hidden text-center py-6 text-gray-400 text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {data.map((item, index) => renderItem(item, index))}
    </div>
  );
}
